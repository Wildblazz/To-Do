const input = document.getElementById("input");
const enterNote = document.getElementById("enterNote");
const list = document.getElementById("list");
const date = document.getElementById("date");
const calendar = document.getElementById("calendar");
const today = document.getElementById("today");
const active = document.getElementById("active");
const all = document.getElementById("all");
const completed = document.getElementById("completed");
const item = document.getElementsByClassName("item");
let noteList = getNoteListFromLocalStorage();
let id = (noteList && noteList.length > 0 && noteList[noteList.length - 1].noteId) ? noteList[noteList.length - 1].noteId + 1 : 0;
let currentDate = new Date(Date.now());
let noteType = '';

// Icons
const CHECK_ICON = "fa fa-check-circle co";
const UNCHECK_ICON = "fa fa-circle-thin co";

class Note {
    constructor(noteId, state, text, date) {
        this.noteId = noteId;
        this.state = state;
        this.text = text;
        this.date = date;
    }
}

// Init app
renderNotes()


//Handle localStorage content
function renderNotes() {
    if (noteList.length > 0) {
        for (const el of noteList) {
            renderNoteList(el);
        }
    }
}

function saveNodeListToLocalStorage() {
    localStorage.setItem("noteList", JSON.stringify(noteList));
}

function getNoteListFromLocalStorage() {
    return localStorage.getItem("noteList") ? JSON.parse(localStorage.getItem("noteList")) : [];
}

//handle date
setDate(new Date());
calendar.addEventListener("change", () => {
    currentDate = new Date(calendar.value);
    setDate(currentDate);
    eraseRenderedNotes();
    renderNotes()
});
today.addEventListener("click", () => {
    currentDate = new Date(Date.now());
    calendar.value = currentDate.toISOString().split('T')[0]
    setDate(currentDate);
    eraseRenderedNotes();
    renderNotes()
});

function setDate(someDate) {
    const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    date.innerText = new Date(Date.parse(someDate)).toLocaleDateString(undefined, options);
}

//Handle add note event
enterNote.addEventListener("click", () => {
    handleAddNote();
})
input.addEventListener("keyup", (e) => {
    if (e.key === 'Enter') {
        handleAddNote();
    }
});

function handleAddNote() {
    if (noteType) {
        changeNoteType('');
    }
    renderAndSaveNoteList(new Note(id, 'active', input.value, currentDate));
    input.value = '';
}

function renderAndSaveNoteList(note) {
    if (renderNoteList(note)) {
        noteList.push(note);
        id++;
        saveNodeListToLocalStorage();
    }
}

function renderNoteList(note) {
    if (note.text && (note.state === noteType || !noteType) && (new Date(Date.parse(note.date)).setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0))) {
        const noteElement = document.createElement("li");
        noteElement.className = 'item';
        noteElement.id = note.noteId;
        noteElement.innerHTML = `
                <i class="${note.state === 'active' ? UNCHECK_ICON : CHECK_ICON}" action="complete" id=${note.noteId}></i>
                <p class="text">${note.text}</p>
                <i class="fa fa-trash-o de" action="remove" id=${note.noteId}></i>
                <i class="fa fa-edit ed" action="edit" id=${note.noteId}></i>
                <input type="text" class="edit" style="display: none" id=${note.noteId}>`
        list.insertAdjacentElement('beforeend', noteElement);
        window.scrollTo(0, document.body.scrollHeight);
        return note;
    }
}

//erase notesList
function eraseRenderedNotes() {
    list.innerHTML = '';
}

//Handle change note event
list.addEventListener("click", e => {
        // const noteId = e.target.getAttribute('id');
        const action = e.target.getAttribute('action');

        if (action === 'complete') {
            const target = document.getElementById(e.target.getAttribute('id'));
            const state = e.target.className === CHECK_ICON ? UNCHECK_ICON : CHECK_ICON;
            e.target.className = state;
            noteList.find(note => note.noteId == target.id).state = state === CHECK_ICON ? 'completed' : 'active';
            saveNodeListToLocalStorage();
        }
        if (action === 'remove') {
            const target = document.getElementById(e.target.getAttribute('id'));
            noteList.splice(noteList.findIndex(note => note.noteId == target.id), 1)

            target.remove()
            saveNodeListToLocalStorage();
        }
        if (action === 'edit') {
            const target = document.getElementById(e.target.getAttribute('id'));
            const text = target.getElementsByClassName('text')[0];
            const editedNote = target.getElementsByClassName('edit')[0];
            editedNote.setAttribute('style', 'display: block')
            editedNote.setAttribute('value', `${text.innerText}`);
            editedNote.addEventListener("keyup", (event) => {
                    if (event.key === 'Enter') {
                        const editedNoteValue = editedNote.value;
                        if (editedNoteValue && text.innerText !== editedNoteValue) {
                            text.innerText = editedNoteValue;
                            noteList.find(note => note.noteId == target.id).text = editedNoteValue;
                            saveNodeListToLocalStorage();
                        }
                        editedNote.setAttribute('style', 'display: none')
                    }
                }
            );
            document.addEventListener("keyup", (event) => {
                if (event.key === 'Escape') {
                    editedNote.setAttribute('style', 'display: none')
                }
            });
        }
    }
);

//handle change type note event
active.addEventListener('click', () => {
    changeNoteType('active');
});
completed.addEventListener('click', () => {
    changeNoteType('completed')
});
all.addEventListener('click', () => {
    changeNoteType('');
});

function changeNoteType(status) {
        noteType = status;
        eraseRenderedNotes();
        renderNotes();
}

