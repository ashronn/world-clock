document.addEventListener('DOMContentLoaded', () => {
    const clockGrid = document.querySelector('.clock-grid');
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Define timezones with city and country names
    const timezones = [
        { id: 'thailand', city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok' },
        { id: 'usa-ny', city: 'New York', country: 'USA', timezone: 'America/New_York' },
        { id: 'usa-la', city: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles' },
        { id: 'japan', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
        { id: 'uk', city: 'London', country: 'UK', timezone: 'Europe/London' },
        { id: 'australia', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
        { id: 'dubai', city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai' },
        { id: 'rio', city: 'Rio de Janeiro', country: 'Brazil', timezone: 'America/Sao_Paulo' }
    ];

    // Function to create a clock card HTML element
    function createClockCard(data) {
        const card = document.createElement('div');
        card.className = 'clock-card';
        card.setAttribute('data-timezone', data.timezone);

        card.innerHTML = `
            <div class="card-header">
                <span class="card-city">${data.city}</span>
                <span class="card-country">${data.country}</span>
            </div>
            <div class="card-time">
                <span class="hours">--</span>:<span class="minutes">--</span>:<span class="seconds">--</span>
                <span class="ampm">--</span>
            </div>
            <div class="card-date">
                <span class="day">--</span>, <span class="date">--</span> <span class="month">--</span> <span class="year">----</span>
            </div>
            <div class="card-day-night-icon"></div>
        `;
        return card;
    }

    // Function to update the time and apply day/night styling for a single card
    function updateClockCard(card) {
        const timezone = card.getAttribute('data-timezone');
        const now = new Date(); // Get current local time
        const options = {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true // For AM/PM format
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(now);

        let hours = '--', minutes = '--', seconds = '--', ampm = '--';
        parts.forEach(part => {
            if (part.type === 'hour') hours = part.value;
            if (part.type === 'minute') minutes = part.value;
            if (part.type === 'second') seconds = part.value;
            if (part.type === 'dayPeriod') ampm = part.value;
        });

        // Update time display
        card.querySelector('.hours').textContent = hours;
        card.querySelector('.minutes').textContent = minutes;
        card.querySelector('.seconds').textContent = seconds;
        card.querySelector('.ampm').textContent = ampm;

        // Update date display
        const dateOptions = {
            timeZone: timezone,
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        };
        const dateString = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
        const dateParts = dateString.split(' '); // e.g., ["Tue,", "30", "Jul", "2024"]

        card.querySelector('.day').textContent = dateParts[0].replace(',', ''); // "Tue"
        card.querySelector('.date').textContent = dateParts[1]; // "30"
        card.querySelector('.month').textContent = dateParts[2]; // "Jul"
        card.querySelector('.year').textContent = dateParts[3]; // "2024"

        // Determine if it's day or night (based on hours)
        const hourInTimeZone = parseInt(hours); // Will be 1-12, AM/PM handled by `ampm`
        const isDay = (ampm === 'AM' && hourInTimeZone >= 6 && hourInTimeZone !== 12) ||
                      (ampm === 'PM' && hourInTimeZone < 6) ||
                      (ampm === 'PM' && hourInTimeZone === 12); // Noon is day

        // Special case for 12 AM (midnight) to 5 AM (should be night)
        if (ampm === 'AM' && hourInTimeZone >= 1 && hourInTimeZone < 6) {
            card.classList.remove('is-day');
            card.classList.add('is-night');
        } else if (isDay) {
            card.classList.remove('is-night');
            card.classList.add('is-day');
        } else { // It's night
            card.classList.remove('is-day');
            card.classList.add('is-night');
        }
    }

    // Initialize and update all clock cards
    function initializeClocks() {
        timezones.forEach(tzData => {
            const card = createClockCard(tzData);
            clockGrid.appendChild(card);
            updateClockCard(card); // Initial update
        });

        // Update all cards every second
        setInterval(() => {
            document.querySelectorAll('.clock-card').forEach(updateClockCard);
        }, 1000);
    }

    // --- Theme Logic ---
    // Function to set the theme (light or dark)
    function setTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            themeToggle.checked = true;
        } else {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.checked = false;
        }
    }

    // Check preferred theme from local storage or system preference
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme === 'dark');
        } else {
            // Check user's system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark);
        }
    }

    // Event listener for theme toggle switch
    themeToggle.addEventListener('change', () => {
        setTheme(themeToggle.checked);
    });

    // Initialize theme and clocks on page load
    initializeTheme();
    initializeClocks();
});