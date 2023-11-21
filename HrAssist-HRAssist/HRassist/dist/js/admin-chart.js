const donutData = {
    labels: ['Permanent', 'Job Order', 'Part-time'],
    data: [100, 50, 20],
};

const myChart1 = document.querySelector('.donutChart');
new Chart(myChart1, {
    type: 'doughnut',
    data: {
        labels: donutData.labels,
        datasets: [{
            label: 'Number of Employees',
            data: donutData.data,
        }]
    },
    options:{
        plugins: {
            legend: {
                display: false,
            }
        }
    },
});

const sampleData = {
    labels: ["Chocolate", "Vanilla", "Strawberry"],
    datasets: [
        {
            label: "Blue",
            backgroundColor: "blue",
            data: [3,7,4]
        },
        {
            label: "Red",
            backgroundColor: "red",
            data: [4,3,5]
        },
        {
            label: "Green",
            backgroundColor: "green",
            data: [7,2,6]
        }
    ]
};

const myChart2 = document.querySelector('.barChart');
new Chart(myChart2, {
    type: 'bar',
    datasets: sampleData.datasets,
    options:{
        plugins: {
            legend: {
                display: false,
            }
        }
    },
});