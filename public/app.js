// Task Manager Application
class TaskManager {
    constructor(user) {
        this.user = user;
        this.tasks = [];
        this.isLoading = false;
        
        // DOM elements
        this.taskForm = document.getElementById('taskForm');
        this.taskTopic = document.getElementById('taskTopic');
        this.taskDescription = document.getElementById('taskDescription');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.tasksList = document.getElementById('tasksList');
        this.loadingTasks = document.getElementById('loadingTasks');
        this.noTasks = document.getElementById('noTasks');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.toast = document.getElementById('toast');
        
        // Bind event listeners
        this.bindEvents();
        
        // Initialize the app
        this.init();
    }
    
    bindEvents() {
        // Form submission
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });
        
        // Clear completed tasks
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());
        
        // Input field focus for better UX
        this.taskTopic.addEventListener('focus', () => {
            this.taskTopic.placeholder = 'What do you need to do?';
        });
        
        this.taskTopic.addEventListener('blur', () => {
            this.taskTopic.placeholder = 'Enter task topic...';
        });
        
        this.taskDescription.addEventListener('focus', () => {
            this.taskDescription.placeholder = 'Add more details about this task...';
        });
        
        this.taskDescription.addEventListener('blur', () => {
            this.taskDescription.placeholder = 'Enter task description...';
        });
    }
    
    async init() {
        if (!this.user) return;
        try {
            await this.loadTasks();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showToast('Failed to load tasks. Please check your Firebase configuration.', 'error');
        }
    }
    
    // Firebase CRUD Operations
    
    // 1. Retrieve All Tasks
    async loadTasks() {
        this.setLoading(true);
        
        try {
            const snapshot = await window.db.collection('tasks')
                .where('userId', '==', this.user.uid)
                .orderBy('createdAt', 'desc')
                .get();
            
            this.tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderTasks();
            this.updateStats();
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showToast('Failed to load tasks. Please check your Firebase configuration.', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    // 2. Create New Task
    async addTask() {
        if (!this.user) return;
        const topic = this.taskTopic.value.trim();
        const description = this.taskDescription.value.trim();
        
        if (!topic) {
            this.showToast('Please enter a task topic.', 'error');
            this.taskTopic.focus();
            return;
        }
        
        if (topic.length > 100) {
            this.showToast('Task topic is too long (max 100 characters).', 'error');
            return;
        }
        
        if (description.length > 500) {
            this.showToast('Task description is too long (max 500 characters).', 'error');
            return;
        }
        
        this.setAddButtonLoading(true);
        
        try {
            const newTask = {
                topic: topic,
                description: description,
                isCompleted: false,
                userId: this.user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await window.db.collection('tasks').add(newTask);
            
            // Add the new task to our local array
            const taskWithId = {
                id: docRef.id,
                ...newTask,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            this.tasks.unshift(taskWithId);
            this.renderTasks();
            this.updateStats();
            
            // Clear form and show success message
            this.taskForm.reset();
            this.showToast('Task added successfully!', 'success');
            
        } catch (error) {
            console.error('Error adding task:', error);
            this.showToast('Failed to add task. Please try again.', 'error');
        } finally {
            this.setAddButtonLoading(false);
        }
    }
    
    // 3. Update Task Status
    async toggleTaskStatus(taskId) {
        if (!this.user) return;
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const newStatus = !task.isCompleted;
        
        try {
            await window.db.collection('tasks').doc(taskId).update({
                isCompleted: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update local task
            task.isCompleted = newStatus;
            task.updatedAt = new Date();
            
            this.renderTasks();
            this.updateStats();
            
            const message = newStatus ? 'Task marked as complete!' : 'Task marked as incomplete!';
            this.showToast(message, 'success');
            
        } catch (error) {
            console.error('Error updating task:', error);
            this.showToast('Failed to update task. Please try again.', 'error');
        }
    }
    
    // 4. Delete Task
    async deleteTask(taskId) {
        if (!this.user) return;
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }
        
        try {
            await window.db.collection('tasks').doc(taskId).delete();
            
            // Remove from local array
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            
            this.renderTasks();
            this.updateStats();
            
            this.showToast('Task deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showToast('Failed to delete task. Please try again.', 'error');
        }
    }
    
    // 5. Clear Completed Tasks
    async clearCompletedTasks() {
        if (!this.user) return;
        const completedTasks = this.tasks.filter(task => task.isCompleted);
        
        if (completedTasks.length === 0) {
            this.showToast('No completed tasks to clear.', 'info');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete ${completedTasks.length} completed task(s)?`)) {
            return;
        }
        
        try {
            // Delete all completed tasks from Firebase
            const deletePromises = completedTasks.map(task => 
                window.db.collection('tasks').doc(task.id).delete()
            );
            
            await Promise.all(deletePromises);
            
            // Remove from local array
            this.tasks = this.tasks.filter(task => !task.isCompleted);
            
            this.renderTasks();
            this.updateStats();
            
            this.showToast(`${completedTasks.length} completed task(s) cleared!`, 'success');
            
        } catch (error) {
            console.error('Error clearing completed tasks:', error);
            this.showToast('Failed to clear completed tasks. Please try again.', 'error');
        }
    }
    
    // UI Rendering Methods
    
    renderTasks() {
        if (this.tasks.length === 0) {
            this.tasksList.innerHTML = '';
            this.noTasks.style.display = 'block';
            return;
        }
        
        this.noTasks.style.display = 'none';
        
        this.tasksList.innerHTML = this.tasks.map(task => `
            <div class="task-item ${task.isCompleted ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox ${task.isCompleted ? 'checked' : ''}" 
                     onclick="taskManager.toggleTaskStatus('${task.id}')"
                     role="checkbox"
                     aria-checked="${task.isCompleted}"
                     tabindex="0"
                     onkeypress="if(event.key === 'Enter' || event.key === ' ') taskManager.toggleTaskStatus('${task.id}')">
                </div>
                <div class="task-content">
                    <div class="task-topic">${this.escapeHtml(task.topic)}</div>
                    ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                    <div class="task-meta">
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(task.createdAt)}</span>
                        ${task.isCompleted ? `<span><i class="fas fa-check"></i> Completed ${this.formatDate(task.updatedAt)}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-delete" 
                            onclick="taskManager.deleteTask('${task.id}')"
                            title="Delete task">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.isCompleted).length;
        const pending = total - completed;
        
        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
        this.pendingTasks.textContent = pending;
        
        // Show/hide clear completed button
        this.clearCompletedBtn.style.display = completed > 0 ? 'flex' : 'none';
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        this.loadingTasks.style.display = loading ? 'block' : 'none';
        
        if (!loading) {
            this.tasksList.style.display = 'block';
        }
    }
    
    setAddButtonLoading(loading) {
        const btnText = this.addTaskBtn.querySelector('.btn-text');
        const btnLoading = this.addTaskBtn.querySelector('.btn-loading');
        
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            this.addTaskBtn.disabled = true;
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            this.addTaskBtn.disabled = false;
        }
    }
    
    showToast(message, type = 'info') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type}`;
        this.toast.classList.add('show');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
    
    // Utility Methods
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatDate(date) {
        if (!date) return 'Unknown';
        
        const now = new Date();
        const taskDate = new Date(date);
        const diffTime = Math.abs(now - taskDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`;
        } else {
            return taskDate.toLocaleDateString();
        }
    }

    setUser(user) {
        this.user = user;
        this.init();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Automatically sign in anonymously
    window.auth.onAuthStateChanged(user => {
        if (user) {
            document.querySelector('.container').style.display = '';
            if (!window.taskManager) {
                window.taskManager = new TaskManager(user);
            } else {
                window.taskManager.setUser(user);
            }
        }
    });
    if (!window.auth.currentUser) {
        window.auth.signInAnonymously().catch(err => {
            alert('Anonymous sign-in failed: ' + err.message);
        });
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.taskManager) {
        window.taskManager.showToast('An unexpected error occurred. Please refresh the page.', 'error');
    }
});

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 