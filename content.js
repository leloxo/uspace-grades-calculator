(function() {
    const SELECTORS = {
        TABLE: '.leistung-table',
        ITEMS: '.leistung-item',
        RESULT_CONTAINER: '.result-container',
        ACCORDION_TOGGLE: '.Accordion__Toggle'
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
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        processGradesTable();

        observeDOM();
        observeAccordion();
    }

    function observeDOM() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    const table = document.querySelector(SELECTORS.TABLE);
                    observer.disconnect();
                    if (table) {
                        processGradesTable();
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
    }

    function observeAccordion() {
        document.body.addEventListener('click', (event) => {
            const toggleButton = event.target.closest(SELECTORS.ACCORDION_TOGGLE);
            if (toggleButton) {
                setTimeout(processGradesTable, 300);
            }
        });

        const attributeObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') {
                    setTimeout(processGradesTable, 300);
                }
            }
        });

        document.querySelectorAll(SELECTORS.ACCORDION_TOGGLE).forEach(toggle => {
            attributeObserver.observe(toggle, { attributes: true });
        });
    }

    function processGradesTable() {
        try {
            const table = document.querySelector(SELECTORS.TABLE);
            if (!table) {
                return;
            }

            const stats = calculateStats();
            if (stats) {
                displayResults(stats);
            }
        } catch (error) {
            console.error('Error processing grades:', error);
        }
    }

    function austrianToGPA(grade) {
        switch (grade) {
            case 1: return 4.0;
            case 2: return 3.0;
            case 3: return 2.0;
            case 4: return 1.0;
            case 5: return 0.0;
            default: return 0.0;
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
        let totalGPA = 0;

        let gradesEcts = {
            one: 0,
            two: 0,
            three: 0,
            four: 0
        }

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
                        totalGPA += austrianToGPA(grade) * ects;

                        switch (grade) {
                            case 1:
                                gradesEcts.one += ects;
                                break;
                            case 2:
                                gradesEcts.two += ects;
                                break;
                            case 3:
                                gradesEcts.three += ects;
                                break;
                            case 4:
                                gradesEcts.four += ects;
                                break;
                        }
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
            failed: failedAttempts,
            gpa: (totalGPA / totalECTS).toFixed(2)
        };
    }

    function displayResults(stats) {
        let resultContainer = document.querySelector(SELECTORS.RESULT_CONTAINER);

        if (!resultContainer) {
            resultContainer = document.createElement('div');
            resultContainer.className = 'result-container';
            resultContainer.style.cssText = STYLES.CONTAINER;

            resultContainer.appendChild(createStatElement('Average', stats.average));
            resultContainer.appendChild(createStatElement('GPA', stats.gpa));
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
                updateStatElement(elements[1], stats.gpa);
                updateStatElement(elements[2], stats.ects);
                updateStatElement(elements[3], stats.courses);
                updateStatElement(elements[4], stats.failed);
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


