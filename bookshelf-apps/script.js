document.addEventListener('DOMContentLoaded', function () {
    const books = []; // Daftar Buku tampungan
    let booksFilter = []; // Buku Tampungan Sementara
    const RENDER_EVENT = 'render-todo';
    const SAVED_EVENT = 'saved-todo';

    const STORAGE_KEY = 'BOOKS_APPS'; // local storage

    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
        // console.log(event);
        // console.log(books);
    });

    /* Main Event */
    document.addEventListener(RENDER_EVENT, function (event) {
        // Reset Render
        const uncompletedBooksList = document.getElementById(
            'incompleteBookshelfList'
        );
        uncompletedBooksList.innerHTML = '';

        const completedBooksList = document.getElementById(
            'completeBookshelfList'
        );
        completedBooksList.innerHTML = '';

        if (booksFilter.length === 0) {
            for (let bookItem of books) {
                if (!bookItem.isCompleted) {
                    uncompletedBooksList.append(makeBooksList(bookItem));
                } else {
                    completedBooksList.append(makeBooksList(bookItem));
                }
            }
        } else {
            for (let bookItem of booksFilter) {
                if (!bookItem.isCompleted) {
                    uncompletedBooksList.append(makeBooksList(bookItem));
                } else {
                    completedBooksList.append(makeBooksList(bookItem));
                }
            }
        }
    });

    // Main Function
    function addBook() {
        const inputBookTitle = document.getElementById('inputBookTitle');
        const inputBookAuthor = document.getElementById('inputBookAuthor');
        const inputBookYear = document.getElementById('inputBookYear');
        const inputBookIsComplete = document.getElementById(
            'inputBookIsComplete'
        );

        const generatedId = generateId();
        const bookObject = generateBookObject(
            generatedId,
            inputBookTitle.value,
            inputBookAuthor.value,
            inputBookYear.value,
            inputBookIsComplete.checked
        );

        books.push(bookObject);

        // Save to local storage
        saveToLocalStorage();

        // Clear Input After Save
        inputBookTitle.value = '';
        inputBookAuthor.value = '';
        inputBookYear.value = '';
        inputBookIsComplete.checked = false;

        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    function makeBooksList(bookObject) {
        const articleElement = document.createElement('article');
        articleElement.classList.add('book_item');
        articleElement.setAttribute('id', `book-${bookObject.id}`);

        // Title
        articleElement.innerHTML =
            '<h3>' +
            bookObject.title +
            '</h3>' +
            '<p>' +
            bookObject.author +
            '</p>' +
            '<p>' +
            bookObject.year +
            '</p>';

        // Delete Button
        const deletedButton = document.createElement('button');
        deletedButton.classList.add('red');
        deletedButton.innerText = 'Hapus Buku';

        deletedButton.addEventListener('click', function () {
            if (confirm('Apakah anda yakin ingin menghapusnya?')) {
                deleteBook(bookObject.id);
                alert('Data berhasil dihapus!');
            }
        });

        if (bookObject.isCompleted) {
            const uncompletedButton = document.createElement('button');
            uncompletedButton.classList.add('green');
            uncompletedButton.innerText = 'Belum selesai di Baca';

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('action');
            buttonContainer.append(uncompletedButton, deletedButton);

            uncompletedButton.addEventListener('click', function () {
                addBookToUncompleted(bookObject.id);
            });

            articleElement.append(buttonContainer);
        } else {
            const completedButton = document.createElement('button');
            completedButton.classList.add('green');
            completedButton.innerText = 'Selesai dibaca';

            const editButton = document.createElement('button');
            editButton.classList.add('cornflowerblue');
            editButton.innerText = 'Edit Buku';

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('action');
            buttonContainer.append(completedButton, deletedButton, editButton);

            completedButton.addEventListener('click', function () {
                addBookToCompleted(bookObject.id);
            });

            editButton.addEventListener('click', function () {
                // Show Modal
                const modalInput = document.getElementById('modal-section');
                modalInput.classList.add('show');

                // Modal Input
                const inputModalBookTitle = document.getElementById(
                    'inputModalBookTitle'
                );
                const inputModalBookAuthor = document.getElementById(
                    'inputModalBookAuthor'
                );
                const inputModalBookYear =
                    document.getElementById('inputModalBookYear');
                const inputModalBookIsComplete = document.getElementById(
                    'inputModalBookIsComplete'
                );

                // Set Initial Value
                inputModalBookTitle.value = bookObject.title;
                inputModalBookAuthor.value = bookObject.author;
                inputModalBookYear.value = bookObject.year;
                inputModalBookIsComplete.checked = bookObject.isCompleted;

                const buttonClose = document.getElementById('button-close');
                buttonClose.addEventListener('click', function () {
                    modalInput.classList.remove('show');
                });

                const inputModalBook =
                    document.getElementById('inputModalBook');

                inputModalBook.addEventListener('submit', function (event) {
                    event.preventDefault();
                    // console.log('sssss');
                    editBook(
                        bookObject.id,
                        inputModalBookTitle.value,
                        inputModalBookAuthor.value,
                        inputModalBookYear.value,
                        inputModalBookIsComplete.checked
                    );

                    modalInput.classList.remove('show');
                });

                // console.log(
                //     inputModalBookTitle.value,
                //     inputModalBookAuthor.value,
                //     inputModalBookYear.value,
                //     inputModalBookIsComplete.checked
                // );
                // addBookToCompleted(bookObject.id);
            });

            articleElement.append(buttonContainer);
        }

        return articleElement;
    }

    // Find Books
    const searchBook = document.getElementById('searchBook');
    searchBook.addEventListener('submit', function (event) {
        event.preventDefault();
        const inputSearch = document.getElementById('searchBookTitle').value;
        const alertSearchBook = document.getElementById('alert-search-book');

        const findBooksQuery = findBookFromQuery(inputSearch);
        if (findBooksQuery.length > 0) {
            booksFilter = findBooksQuery;
            alertSearchBook.classList.remove('show');
        } else {
            booksFilter = [];
            alertSearchBook.classList.add('show');
            setTimeout(function () {
                alertSearchBook.className = alertSearchBook.className.replace(
                    'show',
                    ''
                );
            }, 3000);
        }

        document.dispatchEvent(new Event(RENDER_EVENT));
    });

    // AddOn Function
    function generateId() {
        return +new Date();
    }

    function generateBookObject(id, title, author, year, isCompleted = false) {
        return {
            id,
            title,
            author,
            year,
            isCompleted,
        };
    }

    function addBookToCompleted(bookId) {
        const bookTarget = findBook(bookId);

        if (bookTarget === null) return;

        bookTarget.isCompleted = true;
        document.dispatchEvent(new Event(RENDER_EVENT));

        // Save to local storage
        saveToLocalStorage();
    }

    function addBookToUncompleted(bookId) {
        const bookTarget = findBook(bookId);

        if (bookTarget === null) return;

        bookTarget.isCompleted = false;
        document.dispatchEvent(new Event(RENDER_EVENT));

        // Save to local storage
        saveToLocalStorage();
    }

    function editBook(
        bookId,
        bookTitle,
        bookAuthor,
        bookYear,
        bookCompleted = false
    ) {
        const bookTarget = findBook(bookId);

        // console.log('sex');
        // console.log(bookId, bookTitle, bookAuthor, bookYear, bookCompleted);
        if (bookTarget === null) return;

        bookTarget.title = bookTitle;
        bookTarget.author = bookAuthor;
        bookTarget.year = bookYear;
        bookTarget.isCompleted = bookCompleted;

        // Save to local storage
        saveToLocalStorage();

        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    function deleteBook(bookId) {
        const bookTarget = findIndexBook(bookId);

        if (bookTarget === -1) return;

        books.splice(bookTarget, 1);

        document.dispatchEvent(new Event(RENDER_EVENT));

        // Save to local storage
        saveToLocalStorage();
    }

    function findBook(bookId) {
        return books.find((book) => book.id === bookId) || null;
    }

    function findIndexBook(bookId) {
        return books.map((book) => book.id).indexOf(bookId);
    }

    function findBookFromQuery(query) {
        return (
            books.filter(
                (book) =>
                    book.title.toLowerCase().includes(query.toLowerCase()) ||
                    book.author.toLowerCase().includes(query.toLowerCase()) ||
                    book.year.includes(query)
            ) || null
        );
    }

    // Local Storage Function
    function isStorageExist() {
        return typeof Storage !== 'undefined';
    }

    function saveToLocalStorage() {
        if (isStorageExist()) {
            console.log(books);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
            document.dispatchEvent(new Event(SAVED_EVENT));
        }
    }

    function loadFromLocalStorage() {
        let data = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (data !== null) {
            for (const book of data) {
                books.push(book);
            }
        }

        console.log({ books });

        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    if (isStorageExist()) {
        // console.log('ee');
        loadFromLocalStorage();
    }

    document.addEventListener(SAVED_EVENT, function () {
        console.log({ localStorage: localStorage.getItem(STORAGE_KEY) });

        const snackbar = document.getElementById('snackbar');
        snackbar.className = 'show';
        snackbar.innerText = 'Berhasil Save Item';

        setTimeout(function () {
            snackbar.className = snackbar.className.replace('show', '');
        }, 3000);
    });
});
