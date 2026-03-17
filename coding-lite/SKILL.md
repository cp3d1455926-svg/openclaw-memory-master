---
name: coding-lite
description: Lightweight coding assistant supporting Python script generation and execution, Excel/WPS function automation, mini-program code generation, SQL query assistant. Fast response, minimal context usage.
---

# Coding-Lite - Lightweight Coding Assistant

## Trigger Scenarios

Use this skill when users need quick code generation, automation scripts, data processing, or queries. Suitable for lightweight, high-frequency coding needs.

## Technical Scope

### 1. Python Script Generation & Execution 🐍

**Supported Scenarios:**
- Batch file processing (renaming, format conversion)
- Data scraping (web, API)
- Data analysis (pandas, numpy)
- Office automation (email, file operations)
- Simple web scraping
- Text processing

**Example:**
```python
# Batch rename files
import os
for i, f in enumerate(os.listdir('.')):
    os.rename(f, f'img_{i:03d}.jpg')
```

---

### 2. Excel / WPS Function Automation 📊

**Supported Scenarios:**
- Complex formula writing (VLOOKUP, INDEX/MATCH, array formulas)
- Pivot table configuration
- Conditional formatting
- VBA macro scripts
- WPS automation (Python for WPS)

**Common Formula Templates:**
```excel
=VLOOKUP(A2,Sheet2!$A:$D,4,FALSE)
=INDEX($C:$C,MATCH(1,(A2=$A:$A)*(B2=$B:$B),0))
=SUMPRODUCT((A2:A100="criteria")*(B2:B100))
```

---

### 3. Mini-Program Code Generation 📱

**Supported Platforms:**
- WeChat Mini Program
- Alipay Mini Program
- Douyin Mini Program

**Supported:**
- Page structure (WXML/AXML)
- Styles (WXSS/ACSS)
- Logic (JavaScript/TypeScript)
- Configuration files (app.json)
- Cloud functions

**Example (WeChat Mini Program):**
```javascript
// pages/index/index.js
Page({
  data: { count: 0 },
  onTap() {
    this.setData({ count: this.data.count + 1 })
  }
})
```

---

### 4. SQL Query Assistant 💾

**Supported Databases:**
- MySQL
- PostgreSQL
- SQLite
- SQL Server
- Oracle

**Supported Scenarios:**
- Basic queries (SELECT, JOIN, GROUP BY)
- Complex queries (subqueries, window functions)
- Data operations (INSERT, UPDATE, DELETE)
- Table structure queries
- Performance optimization suggestions

**Example:**
```sql
-- Query average salary by department
SELECT dept, AVG(salary) as avg_sal
FROM employees
GROUP BY dept
ORDER BY avg_sal DESC;

-- Window function example
SELECT name, dept, salary,
       RANK() OVER (PARTITION BY dept ORDER BY salary DESC) as rank
FROM employees;
```

---

## Usage Principles

### ✅ Suitable Scenarios
- Quick prototypes/scripts
- One-time task automation
- Data query/processing
- Learning/reference code
- Simple feature implementation

### ❌ Unsuitable Scenarios
- Large-scale projects (need full engineering)
- High concurrency/performance requirements
- Complex system architecture
- Production critical code

---

## Output Standards

### Code Format
- Simplicity first, avoid over-engineering
- Add necessary comments
- Label dependencies and runtime environment
- Provide usage examples

### Security Notes
- Label potential security risks (e.g., SQL injection)
- Sensitive operations require二次 confirmation
- No malicious code generation

---

## Quick Reference

### Python Common Commands
```bash
python script.py          # Run script
pip install package       # Install dependency
python -m venv venv       # Create virtual environment
```

### Excel Shortcuts
```
Ctrl + `          Show formulas
Ctrl + Shift + ↓  Select range
Alt + =           Auto sum
```

### SQL Debugging
```sql
EXPLAIN SELECT ...    -- View execution plan
SHOW WARNINGS;        -- View warnings
```

---

## Notes

- Confirm environment safety before executing code
- Backup data before operations
- Production code needs complete testing
- Follow open source license requirements

---

*Made with 👻 by Ghost & Jake*
