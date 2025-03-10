function observeDOM() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                const table = document.querySelector('.leistung-table');
                if (table) {
                    observer.disconnect();
                    calculateAverage();
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function calculateAverage() {
    const table = document.querySelector('.leistung-table');
    if (!table) {
        console.error('Table not found');
        return;
    }
    
    const leistungItems = table.querySelectorAll('.leistung-item');
    
    let totalGrade = 0;
    let totalECTS = 0;
    let totalCourses = 0;
    let failedAttempts = 0;

    if (leistungItems.length > 0) {
        Array.from(leistungItems).forEach((item, index) => {
            const cells = item.getElementsByTagName('td');
            
            if (cells.length >= 10) {
                const ects = parseFloat(cells[7].textContent);
                const grade = parseFloat(cells[10].textContent);
                
                if (!isNaN(ects) && !isNaN(grade) && grade < 5) {
                    totalGrade += grade * ects;
                    totalECTS += ects;
                    totalCourses += 1;
                } else if (!isNaN(ects) && !isNaN(grade) && grade === 5) {
                    failedAttempts += 1;
                }
            }
        });
    }

    if (totalECTS === 0) {
        console.error('No valid grades found');
        return;
    }

    const average = totalGrade / totalECTS;

    displayResult(average.toFixed(2), totalECTS, totalCourses, failedAttempts);
}

function displayResult(average, ects, totalCourses, failedAttempts) {
    let resultContainer = document.querySelector('.result-container');
    if (!resultContainer) {
        resultContainer = document.createElement('div');
        resultContainer.className = 'result-container';
        resultContainer.style.cssText = `
            background-color: #e5eff6;
            padding: 8px 20px;
            margin-left: 7px;
            border-radius: 4px;
            display: flex;
            gap: 20px;
        `;

        const averageDiv = document.createElement('div');
        averageDiv.style.fontWeight = '600';
        averageDiv.innerHTML = `Average: <span style="font-weight: 600; color: #0063a6;">${average}</span>`;

        const ectsDiv = document.createElement('div');
        ectsDiv.style.fontWeight = '600';
        ectsDiv.innerHTML = `Total ECTS: <span style="font-weight: 600; color: #0063a6;">${ects}</span>`;

        const coursesDiv = document.createElement('div');
        coursesDiv.style.fontWeight = '600';
        coursesDiv.innerHTML = `Courses Completed: <span style="font-weight: 600; color: #0063a6;">${totalCourses}</span>`;

        const failedDiv = document.createElement('div');
        failedDiv.style.fontWeight = '600';
        failedDiv.innerHTML = `Failed Attempts: <span style="font-weight: 600; color: #0063a6;">${failedAttempts}</span>`;

        resultContainer.appendChild(averageDiv);
        resultContainer.appendChild(ectsDiv);
        resultContainer.appendChild(coursesDiv);
        resultContainer.appendChild(failedDiv);

        const table = document.querySelector('.leistung-table');
        table.parentNode.insertBefore(resultContainer, table);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeDOM);
} else {
    observeDOM();
}