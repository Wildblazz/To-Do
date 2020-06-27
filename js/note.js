// Constraints
const CHECK_ICON = 'fa fa-check-circle co';
const UNCHECK_ICON = 'fa fa-circle-thin co';
const TRASH_ICON = 'fa fa-trash-o de';
const EDIT_ICON = 'fa fa-edit ed';
const ACTION_EDIT = 'edit';
const ACTION_REMOVE = 'remove';
const ACTION_COMPLETE = 'complete';
const STATE_ACTIVE = 'active';
const STATE_COMPLETED = 'completed';
const ATTRIBUTE_ID = 'id';
const ATTRIBUTE_ACTION = 'action';
const EVENT_CLICK = 'click';
const LS_NOTE_LIST = 'noteList';
const CLASS_TEXT = 'text';
const CLASS_ITEM = 'item';
const CLASS_SHOW_MODAL = 'show-modal';

const input = document.getElementById("input");
const list = document.getElementById("list");
const date = document.getElementById("date");
const calendar = document.getElementById("calendar");
const today = document.getElementById("today");
const active = document.getElementById("active");
const all = document.getElementById("all");
const completed = document.getElementById("completed");
const item = document.getElementsByClassName("item");
const modal = document.querySelector(".modal");
const modalInput = document.getElementById("modal-input");
const submitButton = document.getElementById("edit-submit");
const closeButton = document.querySelector(".cancel");
let noteList = getNoteListFromLocalStorage();
let id = (noteList && noteList.length > 0 && noteList[noteList.length - 1].noteId) ? noteList[noteList.length - 1].noteId + 1 : 0;
let currentDate = new Date(Date.now());
let noteType = '';
let selectedNote = '';

class Note {
    constructor(noteId, state, text, date) {
        this.noteId = noteId;
        this.state = state;
        this.text = text;
        this.date = date;
    }
}

// Init app
function intApp(){
    renderNotes();
    setDate(new Date());
}

//Handle localStorage content
function renderNotes() {
    if (noteList.length > 0) {
        for (const el of noteList) {
            renderNoteList(el);
        }
    }
}

function saveNodeListToLocalStorage() {
    localStorage.setItem(LS_NOTE_LIST, JSON.stringify(noteList));
}

function getNoteListFromLocalStorage() {
    return localStorage.getItem(LS_NOTE_LIST) ? JSON.parse(localStorage.getItem(LS_NOTE_LIST)) : [];
}

//handle date
function setDate(someDate) {
    const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    date.innerText = new Date(Date.parse(someDate)).toLocaleDateString(undefined, options);
}

// handle add note
function handleAddNote() {
    if (input.value === '\n') {
        input.value = '';
        return;
    }
    if (noteType) {
        changeNoteType('');
    }
    renderAndSaveNoteList(new Note(id, STATE_ACTIVE, input.value, currentDate));
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
        noteElement.className = CLASS_ITEM;
        noteElement.id = note.noteId;
        noteElement.innerHTML = `
                <i class='${note.state === STATE_ACTIVE ? UNCHECK_ICON : CHECK_ICON}' action=${ACTION_COMPLETE} id=${note.noteId}></i>
                <p class='${CLASS_TEXT}'>${note.text}</p>
                <i class='${TRASH_ICON}' action=${ACTION_REMOVE} id=${note.noteId}></i>
                <i class='${EDIT_ICON}' action=${ACTION_EDIT} id=${note.noteId}></i>
`
        list.insertAdjacentElement('beforeend', noteElement);
        window.scrollTo(0, document.body.scrollHeight);
        return note;
    }
}

//erase notesList
function eraseRenderedNotes() {
    list.innerHTML = '';
}

//handle change type note event
function changeNoteType(status) {
    noteType = status;
    eraseRenderedNotes();
    renderNotes();
}

//edit note modal
function toggleModal() {
    modal.classList.toggle(CLASS_SHOW_MODAL);
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

function editNote(e) {
    const target = document.getElementById(selectedNote);
    const text = target.getElementsByClassName(CLASS_TEXT)[0];
    if (modalInput.value && modalInput.value !== text.innerText) {
        text.innerText = modalInput.value;
        noteList.find(note => note.noteId.toString() === selectedNote).text = text.innerText;
        saveNodeListToLocalStorage();
    }
}

//Event listeners

//initApp
window.onload = () => intApp();

//date
calendar.addEventListener("change", () => {
    currentDate = new Date(calendar.value);
    setDate(currentDate);
    eraseRenderedNotes();
    renderNotes()
});
today.addEventListener(EVENT_CLICK, () => {
    currentDate = new Date(Date.now());
    calendar.value = currentDate.toISOString().split('T')[0]
    setDate(currentDate);
    eraseRenderedNotes();
    renderNotes()
});

// add note
document.addEventListener(EVENT_CLICK, () => {
    if (input.value) {
        input.style.width = '100%';
    }
})
input.addEventListener("keyup", (e) => {
    if (e.key === 'Enter') {
        handleAddNote();
    }
});

//changing note event
list.addEventListener(EVENT_CLICK, e => {
        const action = e.target.getAttribute(ATTRIBUTE_ACTION);

        if (action === ACTION_COMPLETE) {
            const target = document.getElementById(e.target.getAttribute(ATTRIBUTE_ID));
            const state = e.target.className === CHECK_ICON ? UNCHECK_ICON : CHECK_ICON;
            e.target.className = state;
            noteList.find(note => note.noteId.toString() === target.id).state = state === CHECK_ICON ? STATE_COMPLETED : STATE_ACTIVE;
            saveNodeListToLocalStorage();
        }
        if (action === ACTION_REMOVE) {
            const target = document.getElementById(e.target.getAttribute(ATTRIBUTE_ID));
            noteList.splice(noteList.findIndex(note => note.noteId.toString() === target.id), 1)

            target.remove()
            saveNodeListToLocalStorage();
        }
        if (action === ACTION_EDIT) {
            const target = document.getElementById(e.target.getAttribute(ATTRIBUTE_ID));
            const text = target.getElementsByClassName(CLASS_TEXT)[0];
            modalInput.innerText = text.innerText;
            selectedNote = target.getAttribute(ATTRIBUTE_ID);
            toggleModal();
        }
    }
);

//Modal
submitButton.addEventListener(EVENT_CLICK, (e) => {
    editNote(e);
    toggleModal()
});
closeButton.addEventListener(EVENT_CLICK, toggleModal);

window.addEventListener(EVENT_CLICK, windowOnClick);

//changing note type
active.addEventListener(EVENT_CLICK, () => {
    changeNoteType(STATE_ACTIVE);
});
completed.addEventListener(EVENT_CLICK, () => {
    changeNoteType(STATE_COMPLETED)
});
all.addEventListener(EVENT_CLICK, () => {
    changeNoteType('');
});
