document.addEventListener('DOMContentLoaded', function() {
    // 1. Обработка пассажиров
    const passengerTrigger = document.getElementById('passenger-trigger');
    const passengerModal = document.getElementById('passenger-modal');
    
    const counters = {
        adult: {
            element: document.getElementById('adult-count'),
            minus: document.getElementById('adult-minus'),
            plus: document.getElementById('adult-plus'),
            min: 1
        },
        child: {
            element: document.getElementById('child-count'),
            minus: document.getElementById('child-minus'),
            plus: document.getElementById('child-plus'),
            min: 0
        },
        infant: {
            element: document.getElementById('infant-count'),
            minus: document.getElementById('infant-minus'),
            plus: document.getElementById('infant-plus'),
            min: 0
        }
    };

    // Инициализация счетчиков пассажиров
    Object.values(counters).forEach(counter => {
        counter.plus.type = 'button';
        counter.minus.type = 'button';
        
        counter.plus.addEventListener('click', function(e) {
            e.stopPropagation();
            updateCounter(counter, true);
        });
        
        counter.minus.addEventListener('click', function(e) {
            e.stopPropagation();
            updateCounter(counter, false);
        });
        
        updateCounterButtons(counter);
    });

    function updateCounter(counter, increment) {
        let value = parseInt(counter.element.textContent) || counter.min;
        value = increment ? value + 1 : Math.max(counter.min, value - 1);
        counter.element.textContent = value;
        updateCounterButtons(counter);
        updatePassengerSummary();
    }

    function updateCounterButtons(counter) {
        const value = parseInt(counter.element.textContent);
        counter.minus.disabled = value <= counter.min;
        counter.plus.disabled = value >= 10;
    }

    function updatePassengerSummary() {
        const adults = parseInt(counters.adult.element.textContent) || 0;
        const children = parseInt(counters.child.element.textContent) || 0;
        const infants = parseInt(counters.infant.element.textContent) || 0;
        const total = adults + children;
        
        const classLabel = document.querySelector('.class-radio:checked + .class-checkmark + .class-label');
        const selectedClass = classLabel ? classLabel.textContent.toLowerCase() : 'эконом';
        
        let passengerText;
        if (total === 1) passengerText = '1 пассажир';
        else if (total > 1 && total < 5) passengerText = `${total} пассажира`;
        else passengerText = `${total} пассажиров`;
        
        document.getElementById('passenger-summary').textContent = `${passengerText}, ${selectedClass}`;
    }

    // Модальное окно пассажиров
    passengerTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        passengerModal.style.display = passengerModal.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', function(e) {
        if (!passengerTrigger.contains(e.target) && !passengerModal.contains(e.target)) {
            passengerModal.style.display = 'none';
        }
    });

    // 2. Модальные окна навигации
    const modalOverlay = document.getElementById('modal-overlay');
    const modals = document.querySelectorAll('.modal');
    const navLinks = document.querySelectorAll('nav a[data-modal]');
    const closeButtons = document.querySelectorAll('.modal-close');

    if (modalOverlay && modals.length && navLinks.length) {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = this.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                
                if (modal) {
                    modalOverlay.classList.add('active');
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        function closeModal() {
            modalOverlay.classList.remove('active');
            modals.forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';
        }

        modalOverlay.addEventListener('click', closeModal);
        closeButtons.forEach(button => {
            button.addEventListener('click', closeModal);
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeModal();
        });

        modals.forEach(modal => {
            modal.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        });
    }

    // 3. Обработка формы поиска
    const searchForm = document.getElementById('flightSearchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                const searchData = {
                    departure: document.getElementById('departure-city').value,
                    departureName: document.getElementById('departure-city').options[document.getElementById('departure-city').selectedIndex]?.text || '',
                    arrival: document.getElementById('arrival-city').value,
                    arrivalName: document.getElementById('arrival-city').options[document.getElementById('arrival-city').selectedIndex]?.text || '',
                    departureDate: document.getElementById('departure-date').value,
                    returnDate: document.getElementById('return-date').value,
                    adults: parseInt(counters.adult.element.textContent) || 0,
                    children: parseInt(counters.child.element.textContent) || 0,
                    infants: parseInt(counters.infant.element.textContent) || 0,
                    travelClass: document.querySelector('input[name="travel-class"]:checked + .class-checkmark + .class-label')?.textContent?.trim() || 'Эконом'
                };
                
                // Валидация
                if (!searchData.departure || !searchData.arrival || !searchData.departureDate) {
                    alert('Пожалуйста, заполните пункт отправления, назначения и дату вылета');
                    return;
                }
                
                if (searchData.departure === searchData.arrival) {
                    alert('Город отправления и назначения не могут совпадать');
                    return;
                }
                
                if (searchData.adults + searchData.children + searchData.infants === 0) {
                    alert('Пожалуйста, укажите хотя бы одного пассажира');
                    return;
                }
                
                localStorage.setItem('flightSearchData', JSON.stringify(searchData));
                window.location.href = 'ticket.html';
            } catch (error) {
                console.error('Ошибка при отправке формы:', error);
                alert('Произошла ошибка. Пожалуйста, попробуйте ещё раз.');
            }
        });
    }

    // 4. Обработка темы 
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = themeToggle.querySelector('i');
        if (themeIcon) {
            if (savedTheme === 'light') {
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            }
            
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                if (newTheme === 'light') {
                    themeIcon.classList.replace('fa-moon', 'fa-sun');
                } else {
                    themeIcon.classList.replace('fa-sun', 'fa-moon');
                }
            });
        }
    }

    // 5. Обработка about-modal 
    const aboutModal = document.getElementById('about-modal');
    if (aboutModal) {
        aboutModal.addEventListener('show', animateStats);
    }
});