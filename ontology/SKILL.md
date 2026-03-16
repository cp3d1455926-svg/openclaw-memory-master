---
name: ontology
description: Typed knowledge graph for structured agent memory and composable skills.
author: @oswalpalash
version: 1.0.0
license: MIT
metadata: {"clawdbot":{"emoji":"🧠","requires":{"bins":[]}}}
---

# Ontology - Knowledge Graph Skill

Typed knowledge graph for structured agent memory and composable skills.

## Features

- **Entity Management**: Create, query, and link entities (Person, Project, Task, Event, Document)
- **Relationship Tracking**: Define and traverse relationships between entities
- **Structured Memory**: Organize knowledge in a machine-queryable graph
- **Composable Skills**: Build skills that compose over the ontology

## Usage

### Create Entity

```bash
# Create a person entity
ontology create person --name "John Doe" --email "john@example.com"

# Create a project entity
ontology create project --name "My Project" --status "active"

# Create a task entity
ontology create task --name "Complete report" --due "2026-03-20"
```

### Query Entities

```bash
# List all entities of a type
ontology list persons

# Search entities
ontology search --query "John"

# Get entity by ID
ontology get entity_123
```

### Link Entities

```bash
# Create relationship
ontology link --from entity_123 --to entity_456 --relation "works_on"
```

### Graph Operations

```bash
# Export graph
ontology export --format json

# Import graph
ontology import graph.json
```

## Schema

### Built-in Entity Types

- **Person**: name, email, role, organization
- **Project**: name, status, start_date, end_date, members
- **Task**: name, status, due_date, assignee, priority
- **Event**: name, date, location, attendees
- **Document**: title, type, url, created_at, author

### Custom Entity Types

Define custom types in `ontology/schema.json`:

```json
{
  "types": {
    "Company": {
      "fields": ["name", "industry", "founded", "website"]
    }
  }
}
```

## Integration

### With Memory System

Ontology integrates with the agent's memory system:

- Entities persist across sessions
- Relationships enable contextual recall
- Graph queries power semantic search

### With Other Skills

Ontology can compose with:

- **Calendar**: Events → ontology entities
- **Tasks**: Task management backed by ontology
- **CRM**: Customer/entity tracking
- **Research**: Knowledge graph for research topics

## Best Practices

1. **Use consistent naming**: Entity names should be unique and descriptive
2. **Link related entities**: Create relationships to enable graph traversal
3. **Regular exports**: Backup your ontology graph periodically
4. **Validate schema**: Ensure entities conform to type definitions

## Storage

Ontology data is stored in:
- `~/.openclaw/ontology/graph.json` - Main graph data
- `~/.openclaw/ontology/schema.json` - Type definitions
- `~/.openclaw/ontology/index/` - Search indexes

## Security Notes

- No external network calls
- All data stored locally
- No credential access required
- Safe for workspace file operations

---

*For more info, visit: https://github.com/oswalpalash/ontology*
