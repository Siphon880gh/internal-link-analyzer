# HTML Wizard Interface Context

## Overview
A modern, responsive web wizard that mirrors the CLI's 7-phase interactive flow. Built with HTML5, Tailwind CSS, and jQuery to provide a professional web interface for internal linking optimization configuration.

## Core Module: HTML Wizard (`index.html` - 873 lines)

### Key Responsibilities
- Provide visual, step-by-step wizard interface
- Collect same data structure as CLI with form validation
- Display progress indicators and previous step summaries
- Handle conditional sections and dynamic form behavior
- Generate professional web-based user experience

### Technology Stack
```html
<!-- Dependencies loaded via CDN -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<!-- Custom CSS for enhanced styling -->
.step-indicator { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.fade-in { animation: fadeIn 0.5s ease-in; }
.checkbox-custom, .radio-custom { /* Custom form controls */ }
```

### 7-Phase Wizard Structure

#### Phase 0: Data File Selection
```html
<div id="phase-0" class="phase-content">
  <!-- SEMrush Instructions -->
  <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
    <h3>💡 How to get your internal linking data:</h3>
    <ol>
      <li>Go to SEMrush → Site Audit</li>
      <li>Click "View Details" on Internal Links</li>
      <li>Click "Export to CSV" at the top right</li>
      <li>Save the file in your data directory</li>
    </ol>
  </div>
  
  <!-- File Selection -->
  <select id="dataFileSelect">
    <option value="naecleaningsolutions.com_pages_20250923.csv">
      naecleaningsolutions.com_pages_20250923.csv (19 KB, modified: 9/23/2025)
    </option>
  </select>
  
  <!-- Confirmation Checkbox -->
  <input type="checkbox" id="confirmDataFile">
</div>
```

#### Phase 1: Welcome & Business Goals
```html
<div id="phase-1" class="phase-content">
  <!-- Primary Goal Selection -->
  <div class="space-y-3">
    <label class="radio-custom">
      <input type="radio" name="primaryGoal" value="conversions">
      <span>Increase Conversions (Focus on Money Pages)</span>
    </label>
    <label class="radio-custom">
      <input type="radio" name="primaryGoal" value="traffic">
      <span>Boost Organic Traffic (Focus on Content Pages)</span>
    </label>
    <!-- Additional options... -->
  </div>
  
  <!-- Website Type -->
  <select id="websiteType">
    <option value="service">Service-based business</option>
    <option value="ecommerce">E-commerce store</option>
    <!-- Additional options... -->
  </select>
</div>
```

#### Phase 2: Current State Assessment
```html
<div id="phase-2" class="phase-content">
  <!-- Optimization Areas (Multi-select) -->
  <div class="space-y-3">
    <label class="checkbox-custom">
      <input type="checkbox" name="optimizationAreas" value="orphaned" checked>
      <span>Fix orphaned pages (pages with no internal links)</span>
    </label>
    <label class="checkbox-custom">
      <input type="checkbox" name="optimizationAreas" value="distribution" checked>
      <span>Improve link distribution across content tiers</span>
    </label>
    <!-- Additional options... -->
  </div>
  
  <!-- Content Capacity & Timeline -->
  <div class="space-y-3">
    <label class="radio-custom">
      <input type="radio" name="contentCapacity" value="high">
      <span>High - Create new content and modify existing pages</span>
    </label>
    <!-- Additional options... -->
  </div>
</div>
```

#### Phase 3: Page Priority Selection
```html
<div id="phase-3" class="phase-content">
  <!-- Money Pages Selection -->
  <div class="space-y-3">
    <label class="checkbox-custom">
      <input type="checkbox" name="moneyPages" value="bank-cleaning" checked>
      <span>Expert Financial Institutions & Bank Cleaning (ILR: 100, Links: 64)</span>
    </label>
    <!-- Dynamic choices based on actual data structure -->
  </div>
  
  <!-- Supporting Pages Selection -->
  <div class="space-y-3">
    <label class="checkbox-custom">
      <input type="checkbox" name="supportingPages" value="about" checked>
      <span>About Page (ILR: 88, Links: 64)</span>
    </label>
    <!-- Additional page options... -->
  </div>
  
  <!-- Blog Strategy -->
  <div class="space-y-3">
    <label class="radio-custom">
      <input type="radio" name="blogStrategy" value="clusters" checked>
      <span>Create topic clusters around main services</span>
    </label>
    <!-- Additional strategy options... -->
  </div>
</div>
```

#### Phase 4: Technical Preferences
```html
<div id="phase-4" class="phase-content">
  <!-- WordPress Integration -->
  <div class="space-y-3">
    <label class="radio-custom">
      <input type="radio" name="wordpressIntegration" value="yes" checked>
      <span>Yes - I use WordPress and want plugin recommendations</span>
    </label>
    <!-- Additional options... -->
  </div>
  
  <!-- Conditional WordPress Plugin Section -->
  <div id="wordpressPluginSection">
    <select id="wordpressPlugin">
      <option value="link-whisper">Link Whisper (Recommended)</option>
      <option value="internal-link-juicer">Internal Link Juicer</option>
      <!-- Additional plugins... -->
    </select>
  </div>
  
  <!-- Monitoring Tools -->
  <div class="space-y-3">
    <label class="checkbox-custom">
      <input type="checkbox" name="monitoringTools" value="gsc" checked>
      <span>Google Search Console</span>
    </label>
    <!-- Additional tools... -->
  </div>
</div>
```

#### Phase 5: Report Preferences
```html
<div id="phase-5" class="phase-content">
  <!-- Report Detail Level -->
  <div class="space-y-3">
    <label class="radio-custom">
      <input type="radio" name="reportDetail" value="action-focused" checked>
      <span>Action-Focused - Prioritized tasks and implementation steps</span>
    </label>
    <!-- Additional detail levels... -->
  </div>
  
  <!-- Output Formats -->
  <div class="space-y-3">
    <label class="checkbox-custom">
      <input type="checkbox" name="outputFormats" value="console" checked>
      <span>Console display (terminal output)</span>
    </label>
    <label class="checkbox-custom">
      <input type="checkbox" name="outputFormats" value="html">
      <span>HTML report for web viewing</span>
    </label>
    <!-- Additional formats... -->
  </div>
  
  <!-- Conditional Advanced Metrics -->
  <div id="advancedMetricsSection" style="display: none;">
    <label class="checkbox-custom">
      <input type="checkbox" name="advancedMetrics" value="anchor-text">
      <span>Anchor text distribution analysis</span>
    </label>
    <!-- Additional metrics... -->
  </div>
</div>
```

#### Phase 6: Confirmation & Execution
```html
<div id="phase-6" class="phase-content">
  <!-- Selections Summary -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
    <h3>📋 Your Selections Summary:</h3>
    <div id="selectionsSummary">
      <!-- Populated dynamically by JavaScript -->
    </div>
  </div>
  
  <!-- Final Confirmation -->
  <label>
    <input type="checkbox" id="confirmAnalysis" checked>
    <span>Ready to analyze website data and generate recommendations?</span>
  </label>
  
  <!-- Generate Report Button -->
  <button id="generateReport" class="bg-green-600 text-white px-6 py-3 rounded-lg">
    Generate Optimization Report
  </button>
</div>
```

### JavaScript Functionality

#### Navigation & State Management
```javascript
$(document).ready(function() {
  let currentPhase = 0;
  const totalPhases = 7;
  const wizardData = {};

  // Navigation handlers
  $('#nextBtn').click(function() {
    if (validateCurrentPhase()) {
      saveCurrentPhaseData();
      currentPhase++;
      showPhase(currentPhase);
      updateStepIndicators();
      updatePreviousSteps();
    }
  });

  $('#prevBtn').click(function() {
    if (currentPhase > 0) {
      currentPhase--;
      showPhase(currentPhase);
      updateStepIndicators();
    }
  });
});
```

#### Phase Validation
```javascript
function validateCurrentPhase() {
  switch (currentPhase) {
    case 0: // Data File Selection
      if (!$('#dataFileSelect').val()) {
        alert('Please select a data file.');
        return false;
      }
      if (!$('#confirmDataFile').is(':checked')) {
        alert('Please confirm this is the correct data file.');
        return false;
      }
      break;
    
    case 2: // Assessment
      if (!$('input[name="optimizationAreas"]:checked').length) {
        alert('Please select at least one optimization area.');
        return false;
      }
      break;
    
    // Additional validation for other phases...
  }
  return true;
}
```

#### Data Collection & Persistence
```javascript
function saveCurrentPhaseData() {
  switch (currentPhase) {
    case 0:
      wizardData.selectedDataFile = $('#dataFileSelect').val();
      wizardData.confirmDataFile = $('#confirmDataFile').is(':checked');
      break;
    
    case 1:
      wizardData.primaryGoal = $('input[name="primaryGoal"]:checked').val();
      wizardData.websiteType = $('#websiteType').val();
      break;
    
    case 2:
      wizardData.optimizationAreas = $('input[name="optimizationAreas"]:checked')
        .map(function() { return this.value; }).get();
      wizardData.contentCapacity = $('input[name="contentCapacity"]:checked').val();
      wizardData.timeline = $('input[name="timeline"]:checked').val();
      break;
    
    // Additional data collection for other phases...
  }
}
```

#### Conditional Logic
```javascript
// WordPress integration conditional display
$('input[name="wordpressIntegration"]').change(function() {
  if ($(this).val() === 'yes') {
    $('#wordpressPluginSection').show();
  } else {
    $('#wordpressPluginSection').hide();
  }
});

// Advanced metrics conditional display
$('input[name="reportDetail"]').change(function() {
  if ($(this).val() === 'detailed') {
    $('#advancedMetricsSection').show();
  } else {
    $('#advancedMetricsSection').hide();
  }
});
```

### Visual Design Features

#### Step Progress Indicators
```css
.step-complete {
  background: #10b981;  /* Green for completed steps */
}
.step-current {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: pulse 2s infinite;  /* Animated current step */
}
.step-pending {
  background: #e5e7eb;  /* Gray for pending steps */
  color: #9ca3af;
}
```

#### Custom Form Controls
```css
.checkbox-custom input[type="checkbox"]:checked {
  background: #667eea;
}
.checkbox-custom input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  color: white;
  font-weight: bold;
}

.radio-custom input[type="radio"]:checked {
  background: #667eea;
  border: 2px solid #667eea;
}
```

#### Responsive Layout
```css
@media (max-width: 768px) {
  .step-indicators {
    flex-direction: column;
    gap: 10px;
  }
  
  .wizard-content {
    padding: 20px;
  }
}
```

### Previous Steps Sidebar
```javascript
function updatePreviousSteps() {
  const summaryHtml = [];
  
  if (wizardData.selectedDataFile) {
    summaryHtml.push(`
      <div class="p-3 bg-gray-50 rounded border-l-4 border-blue-400">
        <strong>📂 Data File:</strong> ${wizardData.selectedDataFile}
      </div>
    `);
  }
  
  if (wizardData.primaryGoal) {
    const goalLabels = {
      conversions: 'Increase Conversions',
      traffic: 'Boost Organic Traffic',
      authority: 'Build Authority & Trust',
      balanced: 'Balanced Approach'
    };
    summaryHtml.push(`
      <div class="p-3 bg-gray-50 rounded border-l-4 border-green-400">
        <strong>📋 Primary Goal:</strong> ${goalLabels[wizardData.primaryGoal]}
      </div>
    `);
  }
  
  // Additional summary items...
  $('#previousSteps').html(summaryHtml.join(''));
}
```

### Data Structure Compatibility
The wizard collects data in the exact same structure as the CLI:
```javascript
wizardData = {
  // Phase 0
  selectedDataFile: 'filename.csv',
  confirmDataFile: true,
  
  // Phase 1
  primaryGoal: 'conversions',
  websiteType: 'service',
  
  // Phase 2
  optimizationAreas: ['orphaned', 'distribution', 'technical'],
  contentCapacity: 'medium',
  timeline: 'moderate',
  
  // Phase 3
  moneyPages: ['bank-cleaning', 'medical-cleaning'],
  supportingPages: ['about', 'day-porter'],
  blogStrategy: 'clusters',
  
  // Phase 4
  wordpressIntegration: 'yes',
  wordpressPlugin: 'link-whisper',
  linkManagement: 'hybrid',
  monitoringTools: ['gsc', 'ga'],
  
  // Phase 5
  reportDetail: 'action-focused',
  outputFormats: ['console', 'html'],
  createActionPlan: true,
  
  // Phase 6
  confirmAnalysis: true
};
```

### Integration Points
- **Data Structure**: Identical to CLI for seamless backend integration
- **Validation Rules**: Same requirements as CLI validation
- **Conditional Logic**: Mirrors CLI conditional question flow
- **User Experience**: Professional presentation suitable for client demos
- **Accessibility**: Keyboard navigation, screen reader friendly
- **Performance**: Lightweight, fast loading with CDN dependencies

The HTML wizard provides a modern, user-friendly alternative to the CLI while maintaining complete functional parity and data structure compatibility.
