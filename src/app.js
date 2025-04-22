function familycartApp() {
    return {
        items: [],
        newItem: '',

        init() {
            this.loadItems()
        },

        async loadItems() {
            try {
                const res = await fetch('/items')
                const data = await res.json()
                console.log('Fetched items:', data)
                this.items = data
            } catch (e) {
                console.error('Failed to load items:', e)
                this.items = []
            }
        },

        async addItem() {
            if (!this.newItem.trim()) return
            await fetch('/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: this.newItem }),
            })
            this.newItem = ''
            this.loadItems()
        },

        async toggleItem(id) {
            await fetch(`/items/${id}/toggle`, { method: 'POST' })
            this.loadItems()
        },

        async deleteItem(id) {
            await fetch(`/items/${id}`, { method: 'DELETE' })
            this.loadItems()
        },

        async editItem(item) {
            const newName = prompt('Edit item name:', item.name)
            if (!newName || newName === item.name) return
            await fetch(`/items/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName }),
            })
            this.loadItems()
        },

        async uploadScreenshot() {
            const input = this.$refs.screenshot
            if (!input.files[0]) return
            const formData = new FormData()
            formData.append('screenshot', input.files[0])

            await fetch('/upload', {
                method: 'POST',
                body: formData,
            })

            input.value = ''
            this.loadItems()
        },
    }
}
