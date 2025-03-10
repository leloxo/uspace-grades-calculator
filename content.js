(function() {
    const SELECTORS = {
        TABLE: '.leistung-table',
        ITEMS: '.leistung-item',
        RESULT_CONTAINER: '.result-container',
    };

    const STYLES = {
        CONTAINER: `
            background-color: #e5eff6;
            padding: 8px 20px;
            margin-left: 7px;
            border-radius: 4px;
            display: flex;
            gap: 20px;
        `,
        LABEL: 'font-weight: 600;',
        VALUE: 'font-weight: 600; color: #0063a6;'
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initObserver);
    } else {
        initObserver();
    }

    function initObserver() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    const table = document.querySelector(SELECTORS.TABLE);
                    if (table) {
                        observer.disconnect();
                        processGradesTable();
                        return;
                    }
                }
            }
        });
    
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });

        const table = document.querySelector(SELECTORS.TABLE);
        if (table) {
            observer.disconnect();
            processGradesTable();
        }
    }

    function processGradesTable() {
        try {
            const stats = calculateStats();
            if (stats) {
                displayResults(stats);
            }
        } catch (error) {
            console.error('Error processing grades:', error);
        }
    }

    function calculateStats() {
        const table = document.querySelector(SELECTORS.TABLE);
        if (!table) {
            console.error('Table not found');
            return null;
        }
        
        const leistungItems = table.querySelectorAll(SELECTORS.ITEMS);
        
        let totalGrade = 0;
        let totalECTS = 0;
        let totalCourses = 0;
        let failedAttempts = 0;

        if (leistungItems.length === 0) {
            console.warn('No grade items found');
            return null;
        }

        for (const item of leistungItems) {
            const cells = item.getElementsByTagName('td');
                
            if (cells.length >= 10) {
                const ects = parseFloat(cells[7].textContent.trim());
                const grade = parseFloat(cells[10].textContent.trim());
                
                if (!isNaN(ects) && !isNaN(grade)) {
                    if (grade < 5) {
                        totalGrade += grade * ects;
                        totalECTS += ects;
                        totalCourses += 1;
                    } else if (grade === 5) {
                        failedAttempts += 1;
                    }
                }
            }
        }
    
        if (totalECTS === 0) {
            console.warn('No valid grades found');
            return null;
        }

        return {
            average: (totalGrade / totalECTS).toFixed(2),
            ects: totalECTS,
            courses: totalCourses,
            failed: failedAttempts
        };
    }

    function displayResults(stats) {
        let resultContainer = document.querySelector(SELECTORS.RESULT_CONTAINER);

        if (!resultContainer) {
            resultContainer = document.createElement('div');
            resultContainer.className = 'result-container';
            resultContainer.style.cssText = STYLES.CONTAINER;

            resultContainer.appendChild(createStatElement('Average', stats.average));
            resultContainer.appendChild(createStatElement('Total ECTS', stats.ects));
            resultContainer.appendChild(createStatElement('Courses Completed', stats.courses));
            resultContainer.appendChild(createStatElement('Failed Attempts', stats.failed));
    
            const table = document.querySelector(SELECTORS.TABLE);
            if (table && table.parentNode) {
                table.parentNode.insertBefore(resultContainer, table);
            }
        } else {
            const elements = resultContainer.children;
            if (elements.length >= 4) {
                updateStatElement(elements[0], stats.average);
                updateStatElement(elements[1], stats.ects);
                updateStatElement(elements[2], stats.courses);
                updateStatElement(elements[3], stats.failed);
            }
        }
    }

    function createStatElement(label, value) {
        const element = document.createElement('div');
        element.style.cssText = STYLES.LABEL;
        element.innerHTML = `${label}: <span style="${STYLES.VALUE}">${value}</span>`;
        return element;
    }

    function updateStatElement(element, value) {
        const valueSpan = element.querySelector('span');
        if (valueSpan) {
            valueSpan.textContent = value;
        }
    }
})();


