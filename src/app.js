function familycartApp() {
    return {
        items: [],
        newItem: '',
        editingId: null, // Track which item is being edited
        editValue: '', // Current value during editing

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

        async deleteItem(id) {
            await fetch(`/items/${id}`, { method: 'DELETE' })
            this.loadItems()
        },

        startEditing(item) {
            this.editingId = item.id
            this.editValue = item.name
            this.$nextTick(() => {
                const input = this.$root.querySelector(`#edit-input-${item.id}`)
                if (input) input.focus()
            })
        },

        async saveEdit(item) {
            const newName = this.editValue.trim()
            if (!newName || newName === item.name) {
                this.cancelEdit()
                return
            }
            await fetch(`/items/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName }),
            })
            this.cancelEdit()
            this.loadItems()
        },

        cancelEdit() {
            this.editingId = null
            this.editValue = ''
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
