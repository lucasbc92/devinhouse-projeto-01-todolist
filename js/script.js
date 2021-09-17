function load() {
  const tasks = JSON.parse(localStorage.getItem("@toDoList:tasks"));
  if (tasks === null) {
    return;
  }
  for (const task of tasks) {
    createListItem(task["task"], task["isChecked"]);
  }
}

function save() {
  const lis = document.querySelector("#toDoList").children;
  const tasks = [];

  for (const li of lis) {
    const task = li.children[1].innerHTML;
    const isChecked = li.children[0].checked;
    tasks.push({ task, isChecked });
  }

  localStorage.setItem("@toDoList:tasks", JSON.stringify(tasks));
}

function createListItem(text, isChecked = false) {
  const ul = document.querySelector("#toDoList");

  const li = document.createElement("li");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.addEventListener("change", strikeThroughTask);
  const span = document.createElement("span");
  span.innerHTML = text;
  span.classList.add("task");
  const buttonTTS = document.createElement("button");
  buttonTTS.innerHTML = `<i class="fa fa-volume-up"></i>`;
  buttonTTS.addEventListener("click", textToSpeech);
  const buttonDelete = document.createElement("button");
  buttonDelete.innerHTML = `<i class="fa fa-trash"></i>`;
  buttonDelete.addEventListener("click", deleteTask);

  if (isChecked) {
    checkbox.checked = true;
    span.classList.add("done");
  }

  li.appendChild(checkbox);

  checkbox.insertAdjacentElement("afterend", span);
  span.insertAdjacentElement("afterend", buttonTTS);
  buttonTTS.insertAdjacentElement("afterend", buttonDelete);

  ul.appendChild(li);
}

function addTask(event) {
  event.preventDefault();

  const taskElement = document.querySelector("#inputTask");
  const task = taskElement.value;

  if (task.length === 0) {
    alert("Digite o nome da tarefa.");
    return;
  }

  createListItem(task);

  taskElement.value = "";

  save();
}

function strikeThroughTask(event) {
  const span = event.target.parentElement.children[1];
  if (event.target.checked) {
    span.classList.add("done");
  } else {
    span.classList.remove("done");
  }
  save();
}

function deleteTask(event) {
  sweetAlert
    .fire({
      title: "Tem certeza?",
      text: "Deseja apagar esta tarefa?",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
    })
    .then((result) => {
      if (result.isConfirmed) {
        event.target.parentElement.remove();
        save();
      }
    });
}

async function textToSpeech(event) {
  console.log(event);
  const span = event.path[1].children[1];
  const text = span.innerText;
  const input = {
    text: text,
  };
  const voice = {
    languageCode: "pt-BR",
    ssmlGender: "MALE",
  };
  const audioConfig = {
    audioEncoding: "OGG_OPUS",
  };

  const rawResponse = await fetch(
    "https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyAyiSvc5W10cPhyRrgeoTPcQI0GFddUy9E",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input, voice, audioConfig }),
    }
  );
  const content = await rawResponse.json();
  const b64toBlob = async (base64, type = "application/octet-stream") => {
    const response = await fetch(`data:${type};base64,${base64}`);
    const content = await response.blob();
    return content;
  };
  //fetch(`data:${type};base64,${base64}`).then((res) => res.blob());

  const contentBlob = await b64toBlob(content.audioContent, "audio/ogg");
  const audioURL = URL.createObjectURL(contentBlob);
  const audio = new Audio(audioURL);
  audio.play();
}
