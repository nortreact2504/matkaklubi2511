const allHikesUrl = '/api/matk'

/**
 * Logout function
 * Calls logout API and redirects to home page
 */
async function logout() {
	try {
		const response = await fetch('/api/auth/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		
		const data = await response.json();
		
		if (response.ok && data.success) {
			// Redirect to home page
			window.location.href = data.redirectUrl || '/';
		} else {
			alert('Väljalogimine ebaõnnestus');
		}
	} catch (error) {
		console.error('Logout error:', error);
		alert('Väljalogimine ebaõnnestus');
	}
}

/**
 * Wrapper for fetch to handle authentication errors
 * Automatically redirects to login if session expired (401)
 */
async function authenticatedFetch(url, options = {}) {
	try {
		const response = await fetch(url, options);
		
		// Check for authentication error
		if (response.status === 401) {
			// Session expired, redirect to login
			console.log('Session expired, redirecting to login...');
			window.location.href = '/login';
			return null;
		}
		
		return response;
	} catch (error) {
		console.error('Fetch error:', error);
		throw error;
	}
}

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
        id: hike.id,
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

function getRightPaneHtml({id, nimi, kirjeldus, osalejad}) {
    let osalejateHtml = ""
    osalejad.forEach((osaleja) => {
        osalejateHtml += `
        <div class="row">
            <div class=col-4>${osaleja.nimi}</div>
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
            <div class=col-4>Nimi</div>
            <div class=col-6>Email</div>
        </div>
        ${osalejateHtml}   
        <div class="row">
            <div class="col-4">
                <input type="text" id="osalejaNimi">
            </div>
            <div class="col-4">
                 <input type="email" id="osalejaEmail">
            </div>
            <div class="col-4">
                 <button class="btn btn-link" onclick="addParticipant('${id}')">Lisa</button>
            </div>
        </div>
    `
}

async function addParticipant(hikeId) {
    console.log(hikeId, document.getElementById('osalejaNimi').value)
    const osaljeaNimi = document.getElementById('osalejaNimi').value
    const osalejaEmail = document.getElementById('osalejaEmail').value

    if (!osaljeaNimi || !osalejaEmail) {
        return
    }

    await postHikeParticipant({
        id: hikeId,
        name: osaljeaNimi,
        email: osalejaEmail
    })
    clickOnLeftPaneRow(hikeId)
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
    const response = await authenticatedFetch(allHikesUrl)
    if (!response) return []; // Session expired
    
    const hikes = await response.json()
    console.log('Andmed laetud', hikes)
    return hikes
}

async function fetchHikeDetails(id) {
    const response = await authenticatedFetch(allHikesUrl + '/' + id)
    if (!response) return null; // Session expired
    
    if (!response.ok) {
        showError('Andmete lugemisel olli viga, proovi uuesti')
        return null;
    }
    const hike = await response.json()
    return hike
}

async function postHikeParticipant({id, name, email}) {
    const participant = {
        nimi: name,
        email: email
    }
    
    const response = await authenticatedFetch(`${allHikesUrl}/${id}/osaleja`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json", 
        },
        body: JSON.stringify(participant)
    })

    if (!response) return null; // Session expired
    
    if (!response.ok) {
        showError('Osaleja lisamine ebaõnnestus, proovi uuesti')
        return null;
    }
}

function showError(errorMessage) {
    console.log(errorMessage)
}

async function initialRender() {
    const hikes = await fetchAllHikes()
    renderPage(hikes, hikes[0]?.id)
}

initialRender()