// OCR extraction logic for receipts
export function extractItemsFromOcr(rawText: string): string[] {
    const nonItemPatterns = [
        /^\d{1,2}:\d{2}/, // time
        /^X Continue Shopping/i,
        /^No Frills( \d+)?$/i,
        /Saving.*Deals/i,
    ]
    const pricePattern = /^(CA\$|\$)\d/
    const qtyMarkerInline = /(\d+\s*\+)/ // inline marker
    const qtyMarkerOnly = /^[^\w\d]*\d+\s*\+[^\w\d]*$/ // line is only a marker (with possible junk)

    const rawLines = rawText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    const items: string[] = []
    let itemBuffer: string[] = []

    function flushItemWithQuantity(quantityStr?: string) {
        let itemTitle = itemBuffer.join(' ').replace(/\s+/g, ' ').trim()
        // Remove all occurrences of '1+' or '1 +' (with optional spaces)
        itemTitle = itemTitle
            .replace(/1\s*\+/g, '')
            .replace(/\s+/g, ' ')
            .trim()
        let quantity = 1
        if (quantityStr) {
            const qtyMatch = quantityStr.match(/(\d+)\s*\+/)
            if (qtyMatch && Number.parseInt(qtyMatch[1], 10) > 1) {
                quantity = Number.parseInt(qtyMatch[1], 10)
            }
        }
        if (itemTitle.length > 0) {
            if (quantity > 1) itemTitle += ` (${quantity}x)`
            items.push(itemTitle)
        }
        itemBuffer = []
    }

    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i]
        // If line is a price line, extract quantity marker from the line itself
        if (pricePattern.test(line)) {
            let quantityStr = undefined
            // Extract quantity marker from the price line (e.g., '$3.98 - 2 +')
            const qtyInPrice = line.match(/(\d+)\s*\+/)
            if (qtyInPrice) {
                quantityStr = qtyInPrice[0]
            } else if (i + 1 < rawLines.length && qtyMarkerOnly.test(rawLines[i + 1])) {
                // Or, check next line for quantity marker (if it exists)
                quantityStr = rawLines[i + 1]
                i++ // Skip the marker line
            }
            flushItemWithQuantity(quantityStr)
            continue
        }
        // Skip non-item lines
        if (nonItemPatterns.some((pat) => pat.test(line))) continue
        // If line is just a quantity marker (possibly with junk), flush buffer
        if (qtyMarkerOnly.test(line)) {
            flushItemWithQuantity(line)
            continue
        }
        // If line contains both product info and a quantity marker
        if (qtyMarkerInline.test(line)) {
            // Remove the quantity marker from the line for the item name
            const marker = line.match(qtyMarkerInline)?.[0]
            const beforeMarker = line.replace(qtyMarkerInline, '').replace(/\s+/g, ' ').trim()
            if (beforeMarker) itemBuffer.push(beforeMarker)
            flushItemWithQuantity(marker)
            continue
        }
        // Otherwise, accumulate line
        itemBuffer.push(line)
    }
    // Flush any remaining buffer (in case last item has no quantity marker)
    if (itemBuffer.length > 0) {
        flushItemWithQuantity()
    }
    return items
}
