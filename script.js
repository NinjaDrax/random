document.addEventListener('DOMContentLoaded', () => {
    const selectors = ['country1', 'country2', 'country3'];
    const timeDisplays = ['time1', 'time2', 'time3'];
    const dateDisplays = ['date1', 'date2', 'date3'];
    const timeInputs = ['input1', 'input2', 'input3'];
    const API_BASE_URL = 'https://worldtimeapi.org/api/timezone';

    let clocks = new Array(3).fill(null);

    async function populateSelectors() {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('Failed to fetch timezones');
            const timezones = await response.json();

            selectors.forEach(selectorId => {
                const selector = document.getElementById(selectorId);
                if (!selector) return;

                // Clear any existing options
                selector.innerHTML = '';

                timezones.forEach(tz => {
                    const option = document.createElement('option');
                    option.value = tz;
                    // Try to create a more readable name
                    const displayName = tz.replace(/_/g, ' ').split('/').pop();
                    option.textContent = displayName;
                    selector.appendChild(option);
                });
            });

            // Set default values after populating
            document.getElementById('country1').value = 'Asia/Kolkata';
            document.getElementById('country2').value = 'America/New_York';
            document.getElementById('country3').value = 'Europe/London';

            // Initialize clocks after setting defaults
            initializeClocks();

        } catch (error) {
            console.error('Error populating selectors:', error);
            // Handle error in UI, maybe show a message
        }
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
            clocks[index] = null; // Clear clock data on error
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

            // Get the date part from the currently displayed time for that clock
            const currentDate = new Date(sourceClock.serverTimeAtFetch.getTime() + (Date.now() - sourceClock.localTimeAtFetch));
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');

            // Construct an ISO 8601 string with the correct offset for the source timezone
            const isoString = `${year}-${month}-${day}T${sourceTimeValue}:00${sourceClock.utcOffset}`;
            const sourceUTCTime = new Date(isoString);

            if (isNaN(sourceUTCTime)) return; // Invalid date created

            // Convert this universal time to each of the other clocks' timezones
            clocks.forEach((targetClock, targetIndex) => {
                if (index !== targetIndex && targetClock) {
                    const targetInput = document.getElementById(timeInputs[targetIndex]);
                    if (targetInput) {
                        // Use Intl.DateTimeFormat for robust timezone conversions
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
