const allHikesUrl = '/api/matk'


function getLeftPaneHTML(hikes) {
    let leftPaneHTML = ``
    hikes.forEach((hike) => {
        leftPaneHTML += `
            <div class="row">
            ${hike.nimetus}
            </div>
        `
    })

    leftPaneHTML += `
    <div class="btn btn-primary">Lisa matk</div>
    `

    return leftPaneHTML
}


function renderPage(hikes) {
    const adminEl = document.getElementById('admin-konteiner')
    const leftPaneHTML = getLeftPaneHTML(hikes)
    const pageHTML = `
        <div class="row">
            <div class="col-4">${leftPaneHTML}</div>
            <div class="col-8">parem paan</div>
        </div>
    `
    adminEl.innerHTML = pageHTML
}

async function fetchAllHikes() {
    const response = await fetch(allHikesUrl)
    const hikes = await response.json()
    console.log('Andmed laetud', hikes)
    return hikes
}

async function initialRender() {
    const hikes = await fetchAllHikes()
    renderPage(hikes)
}

initialRender()