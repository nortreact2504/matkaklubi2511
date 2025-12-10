const allHikesUrl = '/api/matk'

async function clickOnLeftPaneRow(id) {
    console.log('Klikiti real ' + id)
    if (!id) {
        renderErrorRightPane()
        return
    }
    const hikeDetails = await fetchHikeDetails(id)
    console.log(hikeDetails)
    renderRightPane(hikeDetails)
}


function getLeftPaneHTML(hikes) {
    let leftPaneHTML = ``
    hikes.forEach((hike) => {
        leftPaneHTML += `
            <div class="row left-pane-row" onclick="clickOnLeftPaneRow(${hike.id})">
            ${hike.nimetus}
            </div>
        `
    })

    leftPaneHTML += `
    <div class="btn btn-primary">Lisa matk</div>
    `

    return leftPaneHTML
}

function renderRightPane(hike) {
    const rightPaneEl = document.getElementById('right-pane')
    console.log(rightPaneEl)
    const rightPaneHTML = getRightPaneHtml({
        nimi: hike.nimetus,
        kirjeldus: hike.kirjeldus,
        osalejad: hike.osalejad
    })

    rightPaneEl.innerHTML = rightPaneHTML
}

function renderErrorRightPane() {
    const rightPaneEl = document.getElementById('right-pane')
    console.log(rightPaneEl)
    
    rightPaneEl.innerHTML = `
    <div class="alert">
      Ühtegi matka veel ei ole. Lisa mõni
    </div>
    `
}

function getRightPaneHtml({nimi, kirjeldus, osalejad}) {
    let osalejateHtml = ""
    osalejad.forEach((osaleja) => {
        osalejateHtml += `
        <div class="row">
            <div class=col-6>${osaleja.nimi}</div>
            <div class=col-6>${osaleja.email}</div>
        </div>
        `
    })
    return `
        <h2>${nimi}</h2>
        <div class="row">
        ${kirjeldus}
        </div>
        <h3>Osalejad</h3>
        <div class="row">
            <div class=col-6>Nimi</div>
            <div class=col-6>Email</div>
        </div>
        ${osalejateHtml}   
    `
}


function renderPage(hikes, hikeIdInRightPane) {
    const adminEl = document.getElementById('admin-konteiner')
    const leftPaneHTML = getLeftPaneHTML(hikes)
    const pageHTML = `
        <div class="row">
            <div class="col-4">${leftPaneHTML}</div>
            <div id="right-pane" class="col-8">laen ...</div>
        </div>
    `
    adminEl.innerHTML = pageHTML
    clickOnLeftPaneRow(hikeIdInRightPane)
}

async function fetchAllHikes() {
    const response = await fetch(allHikesUrl)
    const hikes = await response.json()
    console.log('Andmed laetud', hikes)
    return hikes
}

async function fetchHikeDetails(id) {
    const response = await fetch(allHikesUrl + '/' + id)
    if (!response.ok) {
        showError('Andmete lugemisel olli viga, proovi uuesti')
        return null;
    }
    const hike = await response.json()
    return hike
}

function showError(errorMessage) {
    console.log(errorMessage)
}

async function initialRender() {
    const hikes = await fetchAllHikes()
    renderPage(hikes, hikes[0]?.id)
}

initialRender()