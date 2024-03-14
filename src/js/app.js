document.addEventListener('DOMContentLoaded', function() {
    const addCardBtn = document.getElementById('addCardBtn');
    const board = document.querySelector('.board');

    // Функция для удаления карточки
    function deleteCard(event) {
        const card = event.target.closest('.card');
        if (card) {
            card.remove();
            saveStateToLocalStorage();
        }
    }

    // Функция для сохранения состояния в LocalStorage
    function saveStateToLocalStorage() {
        const columns = document.querySelectorAll('.column');
        const state = [];

        columns.forEach(column => {
            const cards = Array.from(column.querySelectorAll('.card')).map(card => card.textContent);
            state.push(cards);
        });

        localStorage.setItem('boardState', JSON.stringify(state));
    }

    // Функция для загрузки состояния из LocalStorage
    function loadStateFromLocalStorage() {
        const savedState = JSON.parse(localStorage.getItem('boardState'));

        if (savedState) {
            const columns = document.querySelectorAll('.column');

            columns.forEach((column, columnIndex) => {
                const cards = savedState[columnIndex] || [];

                cards.forEach(cardText => {
                    const card = createCard(cardText);
                    column.appendChild(card);
                });
            });
        }
    }

    // Функция для создания новой карточки
    function createCard(cardText) {
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = cardText;

        // Добавляем иконку крестика для удаления
        const deleteIcon = document.createElement('span');
        deleteIcon.className = 'delete-icon';
        deleteIcon.innerHTML = '&#xE951;';
        deleteIcon.addEventListener('click', deleteCard);

        card.appendChild(deleteIcon);
        card.draggable = true;

        return card;
    }

    // Функция для обновления DOM-дерева после перемещения
    function updateDOMAfterDrop() {
        saveStateToLocalStorage();
        document.querySelectorAll('.drop-before, .drop-after').forEach(element => {
            element.classList.remove('drop-before', 'drop-after');
        });
    }

    // Добавляем обработчики для карточек для отображения иконки крестика и включения drag-and-drop
    document.body.addEventListener('mouseover', function(event) {
        const card = event.target.closest('.card');
        if (card) {
            card.querySelector('.delete-icon').style.visibility = 'visible';
        }
    });

    document.body.addEventListener('mouseout', function(event) {
        const card = event.target.closest('.card');
        if (card) {
            card.querySelector('.delete-icon').style.visibility = 'hidden';
        }
    });

    // Обработчики событий для drag-and-drop
    let draggedCard = null;

    document.addEventListener('dragstart', function(event) {
        const card = event.target.closest('.card');
        if (card) {
            draggedCard = card;
            draggedCard.classList.add('grabbing');
            setTimeout(function() {
                card.style.opacity = '0.5';
            }, 0);
        }
    });

    document.addEventListener('dragend', function(event) {
        if (draggedCard) {
            draggedCard.style.opacity = '1';
            draggedCard.classList.remove('grabbing');
            draggedCard = null;
            updateDOMAfterDrop();
        }
    });

    document.addEventListener('dragover', function(event) {
        event.preventDefault();
        const dropZone = event.target.closest('.column');
        const dropCard = event.target.closest('.card');

        if (dropZone) {
            const rect = dropZone.getBoundingClientRect();
            const mouseY = event.clientY;

            if (mouseY < rect.top + rect.height / 2) {
                dropZone.classList.add('drop-before');
                dropZone.classList.remove('drop-after');
            } else {
                dropZone.classList.add('drop-after');
                dropZone.classList.remove('drop-before');
            }
        }

        if (dropCard) {
            const rect = dropCard.getBoundingClientRect();
            const mouseY = event.clientY;

            if (mouseY < rect.top + rect.height / 2) {
                dropCard.classList.add('drop-before');
                dropCard.classList.remove('drop-after');
            } else {
                dropCard.classList.add('drop-after');
                dropCard.classList.remove('drop-before');
            }
        }
    });

    document.addEventListener('dragleave', function(event) {
        const dropZone = event.target.closest('.column');
        const dropCard = event.target.closest('.card');

        if (dropZone) {
            dropZone.classList.remove('drop-before', 'drop-after');
        }

        if (dropCard) {
            dropCard.classList.remove('drop-before', 'drop-after');
        }
    });

    document.addEventListener('drop', function(event) {
        if (draggedCard) {
            event.preventDefault();
            const dropZone = event.target.closest('.column');
            const dropCard = event.target.closest('.card');

            if (dropZone) {
                if (dropZone.classList.contains('drop-before')) {
                    dropZone.insertBefore(draggedCard, dropZone.firstChild);
                } else {
                    dropZone.appendChild(draggedCard);
                }
            } else if (dropCard) {
                if (dropCard.classList.contains('drop-before')) {
                    dropCard.parentNode.insertBefore(draggedCard, dropCard);
                } else {
                    dropCard.parentNode.insertBefore(draggedCard, dropCard.nextSibling);
                }
            }

            updateDOMAfterDrop();
        }
    });

    // Загружаем состояние из LocalStorage при загрузке страницы
    loadStateFromLocalStorage();

    // Добавляем обработчик для кнопки "Add another card"
    addCardBtn.addEventListener('click', function() {
        const columnId = prompt('Enter the column number (1, 2, or 3):');
        const column = document.getElementById(`column${columnId}`);

        if (column) {
            const cardText = prompt('Enter the card text:');
            const card = createCard(cardText);
            column.appendChild(card);
            updateDOMAfterDrop();
        } else {
            alert('Invalid column number. Please enter 1, 2, or 3.');
        }
    });
});
