document.addEventListener('DOMContentLoaded', () => {
    const selectors = ['country1', 'country2', 'country3'];
    const timeDisplays = ['time1', 'time2', 'time3'];
    const dateDisplays = ['date1', 'date2', 'date3'];
    const timeInputs = ['input1', 'input2', 'input3'];
    const API_BASE_URL = 'https://worldtimeapi.org/api/timezone';

    let clocks = new Array(3).fill(null);

    // Helper function to populate dropdowns
    function populateDropdowns(timezones) {
        selectors.forEach(selectorId => {
            const selector = document.getElementById(selectorId);
            if (!selector) return;

            selector.innerHTML = ''; // Clear existing options
            timezones.forEach(tz => {
                const option = document.createElement('option');
                option.value = tz;
                const displayName = tz.replace(/_/g, ' ').split('/').pop();
                option.textContent = displayName;
                selector.appendChild(option);
            });
        });
    }

    async function populateSelectors() {
        const fallbackTimezones = [
            'America/New_York',
            'Europe/London',
            'Asia/Tokyo',
            'Australia/Sydney',
            'Asia/Kolkata',
            'America/Los_Angeles',
            'Europe/Paris',
            'Asia/Dubai'
        ];

        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('Failed to fetch timezones from API');
            const timezones = await response.json();
            populateDropdowns(timezones);
        } catch (error) {
            console.error('Error populating selectors from API:', error);
            console.log('Using fallback timezone list.');
            populateDropdowns(fallbackTimezones);
        }

        // This part runs regardless of whether the API call succeeded or failed
        document.getElementById('country1').value = 'Asia/Kolkata';
        document.getElementById('country2').value = 'America/New_York';
        document.getElementById('country3').value = 'Europe/London';

        initializeClocks();
    }

    async function fetchTime(timezone, index) {
        try {
            const response = await fetch(`${API_BASE_URL}/${timezone}`);
            if (!response.ok) throw new Error(`Failed to fetch time for ${timezone}`);
            const data = await response.json();

            clocks[index] = {
                element: document.getElementById(timeDisplays[index]),
                dateElement: document.getElementById(dateDisplays[index]),
                serverTimeAtFetch: new Date(data.datetime),
                localTimeAtFetch: Date.now(),
                timezone: data.timezone,
                utcOffset: data.utc_offset
            };

        } catch (error) {
            console.error('Error fetching time:', error);
            const timeDisplay = document.getElementById(timeDisplays[index]);
            if(timeDisplay) {
                timeDisplay.textContent = "Error";
            }
            clocks[index] = null;
        }
    }

    function updateClocks() {
        clocks.forEach(clock => {
            if (clock) {
                const elapsed = Date.now() - clock.localTimeAtFetch;
                const currentTime = new Date(clock.serverTimeAtFetch.getTime() + elapsed);

                const timeString = currentTime.toLocaleTimeString('en-US', { hour12: false, timeZone: clock.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const dateString = currentTime.toLocaleDateString('en-US', { timeZone: clock.timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                clock.element.textContent = timeString;
                clock.dateElement.textContent = dateString;
            }
        });
    }

    async function initializeClocks() {
        const selectedTimezones = selectors.map(id => document.getElementById(id).value);
        await Promise.all([
            fetchTime(selectedTimezones[0], 0),
            fetchTime(selectedTimezones[1], 1),
            fetchTime(selectedTimezones[2], 2)
        ]);
    }

    populateSelectors();
    setInterval(updateClocks, 1000);

    selectors.forEach((selectorId, index) => {
        document.getElementById(selectorId).addEventListener('change', (event) => {
            fetchTime(event.target.value, index);
        });
    });

    timeInputs.forEach((inputId, index) => {
        const inputElement = document.getElementById(inputId);
        inputElement.addEventListener('change', (event) => {
            const sourceTimeValue = event.target.value;
            if (!sourceTimeValue) return;

            const sourceClock = clocks[index];
            if (!sourceClock) return;

            const currentDate = new Date(sourceClock.serverTimeAtFetch.getTime() + (Date.now() - sourceClock.localTimeAtFetch));
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');

            const isoString = `${year}-${month}-${day}T${sourceTimeValue}:00${sourceClock.utcOffset}`;
            const sourceUTCTime = new Date(isoString);

            if (isNaN(sourceUTCTime)) return;

            clocks.forEach((targetClock, targetIndex) => {
                if (index !== targetIndex && targetClock) {
                    const targetInput = document.getElementById(timeInputs[targetIndex]);
                    if (targetInput) {
                        const formatter = new Intl.DateTimeFormat('en-GB', {
                            timeZone: targetClock.timezone,
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        });
                        targetInput.value = formatter.format(sourceUTCTime);
                    }
                }
            });
        });
    });
});
