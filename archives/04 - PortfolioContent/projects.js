// Function to load projects from JSON
async function loadProjects() {
    const response = await fetch('projects.json');
    const projects = await response.json();

    const portfolioGrid = document.getElementById('portfolio-grid');
    
    projects.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.classList.add('portfolio-item');

        projectDiv.innerHTML = `
            <a href="${project.image}" data-lightbox="portfolio" data-title="${project.title}">
                <img src="${project.image}" alt="${project.title}">
            </a>
            <h2>${project.title}</h2>
            <p>${project.description}</p>
            <a href="${project.link}">View More</a>
        `;
        
        portfolioGrid.appendChild(projectDiv);
    });
}

// Call the function when the page loads
window.onload = loadProjects;
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetElement = document.querySelector(this.getAttribute('href'));
        const offsetPosition = targetElement.offsetTop - document.querySelector('header').offsetHeight;
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});