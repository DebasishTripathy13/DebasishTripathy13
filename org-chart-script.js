/**
 * Enterprise IT Security, Risk & Compliance Organization Chart
 * Interactive functionality for collapsible hierarchy and enhanced UX
 */

// Global state management
const OrgChart = {
    collapsedLevels: new Set(),
    collapsedDepartments: new Set(),
    
    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupFunctionalReporting();
        this.setupResponsiveFeatures();
        this.setupAccessibility();
    },
    
    setupEventListeners() {
        // Add click event listeners to employee cards
        document.querySelectorAll('.employee-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('collapse-btn')) {
                    this.showEmployeeDetails(card);
                }
            });
            
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                this.highlightReportingRelationships(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.clearHighlights();
            });
        });
        
        // Setup collapse button functionality
        document.querySelectorAll('.collapse-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = btn.closest('.employee-card').querySelector('.collapse-btn').getAttribute('onclick');
                if (target) {
                    const match = target.match(/toggleLevel\('([^']+)'\)|toggleDepartment\('([^']+)'\)/);
                    if (match) {
                        const identifier = match[1] || match[2];
                        const isLevel = !!match[1];
                        if (isLevel) {
                            this.toggleLevel(identifier);
                        } else {
                            this.toggleDepartment(identifier);
                        }
                    }
                }
            });
        });
    },
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearHighlights();
                this.closeEmployeeDetails();
            }
            
            // Arrow key navigation
            if (e.target.classList.contains('employee-card')) {
                const cards = Array.from(document.querySelectorAll('.employee-card'));
                const currentIndex = cards.indexOf(e.target);
                
                let nextIndex;
                switch (e.key) {
                    case 'ArrowRight':
                        nextIndex = Math.min(currentIndex + 1, cards.length - 1);
                        break;
                    case 'ArrowLeft':
                        nextIndex = Math.max(currentIndex - 1, 0);
                        break;
                    case 'ArrowDown':
                        nextIndex = Math.min(currentIndex + 5, cards.length - 1);
                        break;
                    case 'ArrowUp':
                        nextIndex = Math.max(currentIndex - 5, 0);
                        break;
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        this.showEmployeeDetails(e.target);
                        return;
                }
                
                if (nextIndex !== undefined && nextIndex !== currentIndex) {
                    e.preventDefault();
                    cards[nextIndex].focus();
                }
            }
        });
    },
    
    setupFunctionalReporting() {
        // Define functional reporting relationships
        this.functionalReporting = {
            'IT Security Operations': ['IT Platform Security', 'Identity & Access'],
            'Identity & Access': ['ISC Security'],
            'Risk & Compliance': ['IT Platform Security', 'IT Security Operations', 'Identity & Access', 'ISC Security']
        };
    },
    
    setupResponsiveFeatures() {
        // Handle responsive layout changes
        window.addEventListener('resize', () => {
            this.adjustLayoutForScreenSize();
            this.updateConnectingLines();
        });
        
        this.adjustLayoutForScreenSize();
    },
    
    setupAccessibility() {
        // Add ARIA labels and roles
        document.querySelectorAll('.employee-card').forEach((card, index) => {
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Employee card ${index + 1}, click to view details`);
        });
        
        document.querySelectorAll('.collapse-btn').forEach(btn => {
            btn.setAttribute('aria-label', 'Toggle department visibility');
        });
        
        // Add screen reader announcements
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.id = 'sr-announcement';
        document.body.appendChild(announcement);
    },
    
    toggleLevel(levelId) {
        const level = document.getElementById(levelId);
        if (!level) return;
        
        const btn = event.target;
        
        if (this.collapsedLevels.has(levelId)) {
            level.classList.remove('hidden');
            this.collapsedLevels.delete(levelId);
            btn.textContent = '−';
            btn.setAttribute('aria-label', 'Collapse level');
            this.announceToScreenReader(`Level expanded`);
        } else {
            level.classList.add('hidden');
            this.collapsedLevels.add(levelId);
            btn.textContent = '+';
            btn.setAttribute('aria-label', 'Expand level');
            this.announceToScreenReader(`Level collapsed`);
        }
        
        this.updateConnectingLines();
    },
    
    toggleDepartment(deptId) {
        const dept = document.getElementById(deptId);
        if (!dept) return;
        
        const btn = event.target;
        
        if (this.collapsedDepartments.has(deptId)) {
            dept.classList.remove('collapsed');
            this.collapsedDepartments.delete(deptId);
            btn.textContent = '−';
            btn.setAttribute('aria-label', 'Collapse department');
            this.announceToScreenReader(`Department team expanded`);
        } else {
            dept.classList.add('collapsed');
            this.collapsedDepartments.add(deptId);
            btn.textContent = '+';
            btn.setAttribute('aria-label', 'Expand department');
            this.announceToScreenReader(`Department team collapsed`);
        }
    },
    
    highlightReportingRelationships(card) {
        const deptGroup = card.closest('.department-group');
        if (!deptGroup) return;
        
        const deptClass = Array.from(deptGroup.classList).find(cls => 
            ['platform-security', 'security-operations', 'identity-access', 'isc-security', 'risk-compliance'].includes(cls)
        );
        
        if (deptClass) {
            const deptName = this.getDepartmentName(deptClass);
            const functionalReports = this.functionalReporting[deptName];
            
            if (functionalReports) {
                functionalReports.forEach(reportingDept => {
                    const reportingClass = this.getDepartmentClass(reportingDept);
                    const reportingCards = document.querySelectorAll(`.${reportingClass} .employee-card`);
                    reportingCards.forEach(card => {
                        card.classList.add('highlight-functional');
                    });
                });
            }
        }
    },
    
    clearHighlights() {
        document.querySelectorAll('.highlight-functional').forEach(card => {
            card.classList.remove('highlight-functional');
        });
    },
    
    showEmployeeDetails(card) {
        const name = card.querySelector('.employee-name').textContent;
        const title = card.querySelector('.employee-title').textContent;
        const flag = card.querySelector('.country-flag')?.textContent || '';
        const isMT = card.querySelector('.mt-badge') ? true : false;
        const teamCount = card.querySelector('.team-count')?.textContent || '';
        
        this.createEmployeeModal(name, title, flag, isMT, teamCount);
    },
    
    createEmployeeModal(name, title, flag, isMT, teamCount) {
        // Remove existing modal if present
        this.closeEmployeeDetails();
        
        const modal = document.createElement('div');
        modal.className = 'employee-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${name}</h3>
                    <button class="modal-close" aria-label="Close employee details">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Title:</strong> ${title}</p>
                    ${flag ? `<p><strong>Location:</strong> ${flag}</p>` : ''}
                    ${isMT ? '<p><strong>Management Team Member</strong></p>' : ''}
                    ${teamCount ? `<p><strong>Team Size:</strong> ${teamCount}</p>` : ''}
                    <p><strong>Department:</strong> ${this.getDepartmentFromCard(event.target)}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeEmployeeDetails();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeEmployeeDetails();
            }
        });
        
        // Focus management
        modal.querySelector('.modal-close').focus();
        
        this.announceToScreenReader(`Employee details opened for ${name}`);
    },
    
    closeEmployeeDetails() {
        const modal = document.querySelector('.employee-modal');
        if (modal) {
            modal.remove();
            this.announceToScreenReader('Employee details closed');
        }
    },
    
    getDepartmentName(className) {
        const mapping = {
            'platform-security': 'IT Platform Security',
            'security-operations': 'IT Security Operations',
            'identity-access': 'Identity & Access',
            'isc-security': 'ISC Security',
            'risk-compliance': 'Risk & Compliance'
        };
        return mapping[className] || '';
    },
    
    getDepartmentClass(deptName) {
        const mapping = {
            'IT Platform Security': 'platform-security',
            'IT Security Operations': 'security-operations',
            'Identity & Access': 'identity-access',
            'ISC Security': 'isc-security',
            'Risk & Compliance': 'risk-compliance'
        };
        return mapping[deptName] || '';
    },
    
    getDepartmentFromCard(card) {
        const deptGroup = card.closest('.department-group');
        if (!deptGroup) return 'Executive Level';
        
        const deptClass = Array.from(deptGroup.classList).find(cls => 
            ['platform-security', 'security-operations', 'identity-access', 'isc-security', 'risk-compliance'].includes(cls)
        );
        
        return this.getDepartmentName(deptClass) || 'Unknown Department';
    },
    
    adjustLayoutForScreenSize() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 992;
        
        if (isMobile) {
            // Collapse all departments on mobile for better UX
            document.querySelectorAll('.department-team').forEach(team => {
                if (!this.collapsedDepartments.has(team.id)) {
                    this.toggleDepartment(team.id);
                }
            });
        }
    },
    
    updateConnectingLines() {
        // Update SVG connecting lines based on current layout
        // This would involve recalculating positions of visible elements
        // For now, we'll hide lines on collapsed elements
        const svg = document.querySelector('.org-lines');
        if (svg) {
            svg.style.opacity = this.collapsedLevels.size > 0 ? '0.3' : '1';
        }
    },
    
    announceToScreenReader(message) {
        const announcement = document.getElementById('sr-announcement');
        if (announcement) {
            announcement.textContent = message;
        }
    },
    
    // Search functionality
    searchEmployees(query) {
        const cards = document.querySelectorAll('.employee-card');
        const results = [];
        
        cards.forEach(card => {
            const name = card.querySelector('.employee-name').textContent.toLowerCase();
            const title = card.querySelector('.employee-title').textContent.toLowerCase();
            
            if (name.includes(query.toLowerCase()) || title.includes(query.toLowerCase())) {
                results.push(card);
                card.classList.add('search-highlight');
            } else {
                card.classList.remove('search-highlight');
            }
        });
        
        return results;
    }
};

// Global functions for backward compatibility
function toggleLevel(levelId) {
    OrgChart.toggleLevel(levelId);
}

function toggleDepartment(deptId) {
    OrgChart.toggleDepartment(deptId);
}

// Add modal styles dynamically
const modalStyles = `
    .employee-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    }
    
    .modal-content {
        background: white;
        border-radius: 10px;
        padding: 20px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #2c3e50;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #7f8c8d;
        padding: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .modal-close:hover {
        background: #ecf0f1;
        color: #2c3e50;
    }
    
    .modal-body p {
        margin: 10px 0;
        color: #34495e;
    }
    
    .search-highlight {
        border-color: #f39c12 !important;
        box-shadow: 0 0 15px rgba(243, 156, 18, 0.3) !important;
    }
    
    @keyframes slideIn {
        from {
            transform: translateY(-50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    OrgChart.init();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrgChart;
}