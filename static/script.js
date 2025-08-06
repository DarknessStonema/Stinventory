document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addForm');
    const list = document.getElementById('inventoryList');
    const searchInput = document.getElementById('searchInput');
    const categoryItems = document.querySelectorAll('.category-items');
    const modal = document.getElementById('confirmModal');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
    const itemToDeleteSpan = document.getElementById('itemToDelete');
    const viewDuplicatesBtn = document.getElementById('viewDuplicatesBtn');
    const toast = document.getElementById('toast');

    let initiallyCollapsed = new Set();
    let pendingDelete = null;
    let categoryData = [];

    categoryItems.forEach((category, index) => {
        category.dataset.id = `category-${index}`;
    });

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function updateItemCounter() {
        const counter = document.getElementById('itemCounter');
        if (!counter) return;

        const items = document.querySelectorAll('#inventoryList li');
        const visibleCount = Array.from(items).filter(item => item.style.display !== 'none').length;
        counter.textContent = `${visibleCount} Artikel angezeigt`;
    }

    function loadItems() {
        const currentQuery = searchInput.value.toLowerCase();

        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                categoryData = data;
                list.innerHTML = '';

                const itemCounts = {};
                const duplicateNames = [];

                data.forEach(category => {
                    category.items.forEach(item => {
                        itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
                    });
                });

                for (const [name, count] of Object.entries(itemCounts)) {
                    if (count > 1) duplicateNames.push(name);
                }

                data.forEach(category => {
                    const section = document.createElement('div');
                    section.className = 'category-section';

                    const header = document.createElement('div');
                    header.className = 'category-header';
                    header.textContent = category.category;

                    const toggleIcon = document.createElement('span');
                    toggleIcon.textContent = '−';
                    header.appendChild(toggleIcon);

                    const itemsContainer = document.createElement('div');
                    itemsContainer.className = 'category-items show';

                    header.onclick = () => {
                        itemsContainer.classList.toggle('show');
                        toggleIcon.textContent = itemsContainer.classList.contains('show') ? '−' : '+';
                    };

                    category.items.forEach((item, index) => {
                        const li = document.createElement('li');
                        if (duplicateNames.includes(item.name)) {
                            li.classList.add('duplicate');
                        }

                        const nameInput = document.createElement('input');
                        nameInput.value = item.name;
                        nameInput.disabled = true;
                        nameInput.className = 'item-name';

                        const quantityInput = document.createElement('input');
                        quantityInput.value = item.quantity;
                        quantityInput.disabled = true;

                        const editBtn = document.createElement('button');
                        editBtn.textContent = 'Edit';
                        let editing = false;

                        editBtn.onclick = () => {
                            editing = !editing;
                            nameInput.disabled = !editing;
                            quantityInput.disabled = !editing;
                            editBtn.textContent = editing ? 'Save' : 'Edit';

                            if (!editing) {
                                fetch(`/api/items/${category.category}/${index}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        name: nameInput.value,
                                        quantity: quantityInput.value
                                    })
                                }).then(() => {
                                    loadItems();
                                });
                            }
                        };

                        const delBtn = document.createElement('button');
                        delBtn.textContent = 'Delete';
                        delBtn.onclick = () => {
                            pendingDelete = {
                                category: category.category,
                                index: index
                            };
                            itemToDeleteSpan.textContent = item.name;
                            modal.style.display = 'block';
                        };

                        const buttonGroup = document.createElement('div');
                        buttonGroup.className = 'button-group';
                        buttonGroup.appendChild(editBtn);
                        buttonGroup.appendChild(delBtn);

                        li.appendChild(nameInput);
                        li.appendChild(quantityInput);
                        li.appendChild(buttonGroup);

                        if (item.name.toLowerCase().includes(currentQuery)) {
                            li.style.display = '';
                        } else {
                            li.style.display = 'none';
                        }

                        itemsContainer.appendChild(li);
                    });

                    section.appendChild(header);
                    section.appendChild(itemsContainer);
                    list.appendChild(section);
                });

                viewDuplicatesBtn.style.display = duplicateNames.length > 0 ? 'inline-block' : 'none';
                updateItemCounter();
            });
    }

    viewDuplicatesBtn.onclick = () => {
        const duplicateMap = {};

        categoryData.forEach(category => {
            category.items.forEach(item => {
                if (!duplicateMap[item.name]) {
                    duplicateMap[item.name] = new Set();
                }
                duplicateMap[item.name].add(category.category);
            });
        });

        const duplicates = Object.entries(duplicateMap)
            .filter(([_, categories]) => categories.size > 1)
            .map(([name, categories]) => `${name} → ${Array.from(categories).join(', ')}`);

        if (duplicates.length > 0) {
            alert("Duplikate gefunden:\n\n" + duplicates.join("\n") + "\n\nDuplikate werden auch in der Liste GELB hervorgehoben.");
        } else {
            alert("Keine Duplikate gefunden. \n\nDuplikate werden auch in der Liste GELB hervorgehoben.");
        }
    };

    confirmYes.addEventListener('click', () => {
        if (pendingDelete) {
            fetch(`/api/items/${pendingDelete.category}/${pendingDelete.index}`, {
                method: 'DELETE'
            }).then(() => {
                modal.style.display = 'none';
                showToast("Artikel gelöscht");
                pendingDelete = null;
                loadItems();
            });
        }
    });

    confirmNo.addEventListener('click', () => {
        modal.style.display = 'none';
        pendingDelete = null;
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        const category = document.getElementById('category').value;
        const name = document.getElementById('name').value;
        const quantity = document.getElementById('quantity').value;

        fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, name, quantity })
        }).then(() => {
            form.reset();
            loadItems();
        });
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const items = list.querySelectorAll('li');
        const allCategoryItems = list.querySelectorAll('.category-items');

        items.forEach(item => {
            const nameField = item.querySelector('.item-name');
            const categoryItems = item.closest('.category-items');
            const toggleIcon = categoryItems?.previousElementSibling?.querySelector('span');

            if (nameField && nameField.value.toLowerCase().includes(query)) {
                item.style.display = '';
                if (categoryItems && !categoryItems.classList.contains('show')) {
                    categoryItems.classList.add('show');
                    if (toggleIcon) toggleIcon.textContent = '−';
                }
            } else {
                item.style.display = query === '' ? '' : 'none';
            }
        });

        updateItemCounter();
    });

    loadItems();
});
