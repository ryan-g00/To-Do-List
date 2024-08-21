document.getElementById('title').addEventListener('input', function () {
    document.getElementById('title-char-count').textContent = `${this.value.length}/23`;
});

document.getElementById('content').addEventListener('input', function () {
    document.getElementById('content-char-count').textContent = `${this.value.length}/1000`;
});

document.getElementById('add-task').addEventListener('click', function () {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const date = document.getElementById('date').value;
    const priority = document.querySelector('input[name="priority"]:checked').value;

    if (title && content && date && priority) {
        const timestamp = new Date().getTime(); // 현재 시간을 타임스탬프로 저장
        addTask(title, content, date, priority, timestamp);
    } else {
        alert('모든 필드를 입력해주세요!');
    }
});

function addTask(title, content, date, priority, timestamp) {
    const tasksContainer = document.getElementById('tasks');

    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.dataset.priority = priority;
    taskCard.dataset.timestamp = timestamp; // 타임스탬프를 데이터셋에 추가

    // 중요도에 따른 색깔 설정
    const priorityColor = {
        '임박': '#ff4d4d',
        '보통': '#ffcc00',
        '여유': '#4caf50'
    };

    // 메모를 20글자로 자르기 (카드에 표시할 때만)
    const truncatedContent = content.length > 20 ? content.substring(0, 20) + "..." : content;

    taskCard.innerHTML = `
        <div class="task-priority" style="background-color: ${priorityColor[priority]};"></div>
        <div class="task-details">
            <h3>${title}</h3>
            <p class="full-content" style="display:none;">${content}</p>
            <p class="truncated-content">${truncatedContent}</p>
        </div>
        <div class="task-actions">
            <button class="check">✔️</button>
            <button class="delete">🗑️</button>
        </div>
        <p class="task-date">${date}</p>
    `;

    // 체크 버튼 클릭 시 중요도를 "여유"로 변경
    taskCard.querySelector('.check').addEventListener('click', function (event) {
        event.stopPropagation(); // 체크 버튼 클릭 시 카드 클릭 이벤트가 발생하지 않도록 방지
        taskCard.dataset.priority = '여유';
        taskCard.querySelector('.task-priority').style.backgroundColor = '#4caf50'; // 여유 색상으로 변경
    });

    // 카드 클릭 시 수정 팝업 띄우기
    taskCard.addEventListener('click', function () {
        openEditPopup(taskCard);
    });

    tasksContainer.appendChild(taskCard);

    clearInputs();
    applyFilter(currentFilter);
    sortTasks(currentSort);  // 태스크가 추가된 후에도 정렬 유지
}

function clearInputs() {
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('date').value = '';
    document.querySelector('input[name="priority"][value="임박"]').checked = true;
    document.getElementById('title-char-count').textContent = '0/23';
    document.getElementById('content-char-count').textContent = '0/1000';
}

// 정렬 기능 추가
document.querySelectorAll('.sort-btn').forEach(button => {
    button.addEventListener('click', function () {
        const sortType = this.dataset.sort;
        currentSort = sortType;
        sortTasks(sortType);
    });
});

let currentSort = 'date';  // 기본 정렬은 최신순

function sortTasks(sortType) {
    const tasksContainer = document.getElementById('tasks');
    const tasks = Array.from(tasksContainer.getElementsByClassName('task-card'));

    if (sortType === 'date') {
        tasks.sort((a, b) => b.dataset.timestamp - a.dataset.timestamp); // 타임스탬프를 기준으로 최신순 정렬
    } else if (sortType === 'priority') {
        const priorityOrder = { '임박': 1, '보통': 2, '여유': 3 };
        tasks.sort((a, b) => priorityOrder[a.dataset.priority] - priorityOrder[b.dataset.priority]);
    } else if (sortType === 'deadline') {
        tasks.sort((a, b) => new Date(a.querySelector('.task-date').textContent) - new Date(b.querySelector('.task-date').textContent));
    }

    tasks.forEach(task => tasksContainer.appendChild(task));
}

// 필터링 관련 변수 및 함수
let currentFilter = 'all';

function applyFilter(filter) {
    const tasks = document.querySelectorAll('.task-card');
    tasks.forEach(task => {
        if (filter === 'all' || task.dataset.priority === filter) {
            task.style.display = 'flex';
        } else {
            task.style.display = 'none';
        }
    });
}

document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function () {
        currentFilter = this.dataset.priority;
        applyFilter(currentFilter);
    });
});

// 팝업 관련 코드
const editPopup = document.getElementById('edit-popup');
const closeBtn = document.getElementById('close-popup');
const saveEditBtn = document.getElementById('save-edit');
let currentEditCard;

document.getElementById('tasks').addEventListener('click', function (event) {
    if (event.target.classList.contains('delete')) {
        event.target.closest('.task-card').remove();
        applyFilter(currentFilter);
        sortTasks(currentSort);  // 삭제 후에도 정렬 유지
    }
});

closeBtn.addEventListener('click', function () {
    editPopup.style.display = 'none';
});

saveEditBtn.addEventListener('click', function () {
    const title = document.getElementById('edit-title').value;
    const content = document.getElementById('edit-content').value;
    const date = document.getElementById('edit-date').value;
    const priority = document.querySelector('input[name="edit-priority"]:checked').value;

    currentEditCard.querySelector('h3').innerText = title;
    currentEditCard.querySelector('.full-content').innerText = content;
    currentEditCard.querySelector('.truncated-content').innerText = content.length > 20 ? content.substring(0, 20) + "..." : content;
    currentEditCard.querySelector('.task-date').innerText = date;
    currentEditCard.dataset.priority = priority;

    editPopup.style.display = 'none';
    applyFilter(currentFilter);
    sortTasks(currentSort);  // 수정 후에도 정렬 유지
});

function openEditPopup(taskCard) {
    currentEditCard = taskCard;

    const title = taskCard.querySelector('h3').innerText;
    const content = taskCard.querySelector('.full-content').innerText; // 전체 메모를 가져옴
    const date = taskCard.querySelector('.task-date').innerText;
    const priority = taskCard.dataset.priority;

    document.getElementById('edit-title').value = title;
    document.getElementById('edit-content').value = content;
    document.getElementById('edit-date').value = date;
    document.querySelector(`input[name="edit-priority"][value="${priority}"]`).checked = true;

    editPopup.style.display = 'flex';
}
