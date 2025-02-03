function observeDOM() {
    console.log('Starting DOM observation...');
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                const table = document.querySelector('.leistung-table');
                if (table) {
                    console.log('Table found after dynamic load!');
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
    console.log('Calculating average...');
    
    const table = document.querySelector('.leistung-table');
    if (!table) {
        console.log('Table not found');
        return;
    }
    console.log('Found table:', table);
    
    const leistungItems = table.querySelectorAll('.leistung-item');
    console.log('Number of leistung items:', leistungItems.length);
    
    let totalGrade = 0;
    let totalECTS = 0;
    let totalCourses = 0;
    let failedAttempts = 0;

    if (leistungItems.length > 0) {
        Array.from(leistungItems).forEach((item, index) => {
            const cells = item.getElementsByTagName('td');
            console.log(`Processing row ${index}, cells:`, cells.length);
            
            if (cells.length >= 10) {
                const ects = parseFloat(cells[7].textContent);
                const grade = parseFloat(cells[10].textContent);
                
                console.log(`Row ${index} data:`, {
                    rawECTS: cells[7].textContent,
                    rawGrade: cells[10].textContent,
                    parsedECTS: ects,
                    parsedGrade: grade
                });
                
                if (!isNaN(ects) && !isNaN(grade) && grade < 5) {
                    totalGrade += grade * ects;
                    totalECTS += ects;
                    totalCourses += 1;
                    console.log(`Added grade: ${grade}, ECTS: ${ects}`);
                } else if (!isNaN(ects) && !isNaN(grade) && grade === 5) {
                    failedAttempts += 1;
                }
            }
        });
    }

    if (totalECTS === 0) {
        console.log('No valid grades found');
        return;
    }

    const average = totalGrade / totalECTS;
    console.log(`RESULT - Average: ${average}, Total ECTS: ${totalECTS}`);

    displayResult(average.toFixed(2), totalECTS, totalCourses, failedAttempts);
}

function displayResult(average, ects, totalCourses, failedAttempts) {
    console.log('Displaying result');

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
        // averageDiv.style.color = '#0063a6';
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