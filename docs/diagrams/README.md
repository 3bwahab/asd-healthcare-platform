# Architecture Diagrams

This directory contains visual diagrams documenting the ASD Healthcare Platform architecture using [Mermaid](https://mermaid.js.org/) format.

## Viewing Diagrams

### Option 1: GitHub (Recommended) ✅
GitHub natively renders Mermaid diagrams. Simply view the `.mmd` files directly in the repository or through the main README links.

**Note**: PNG images are **not** included in the repository. All diagrams are stored as `.mmd` (Mermaid) source files and rendered automatically by GitHub.

### Option 2: Mermaid Live Editor
For interactive viewing and editing:
1. Visit [https://mermaid.live](https://mermaid.live)
2. Copy the contents of any `.mmd` file
3. Paste into the editor to view and modify

### Option 3: Generate PNG Images (For External Use)
If you need PNG images for presentations, external documentation, or tools that don't support Mermaid, generate them locally:

```bash
# Install mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Generate all diagrams
cd docs/diagrams

mmdc -i erd.mmd -o erd.png
mmdc -i use-case.mmd -o use-case.png
mmdc -i class-diagram.mmd -o class-diagram.png
mmdc -i auth-flow-sequence.mmd -o auth-flow-sequence.png
mmdc -i appointment-booking-sequence.mmd -o appointment-booking-sequence.png
mmdc -i payment-flow-sequence.mmd -o payment-flow-sequence.png
```

## Diagram Files

| File | Description | View Online |
|------|-------------|-------------|
| `erd.mmd` | Entity Relationship Diagram showing database schema | [View on Mermaid Live](https://mermaid.live) |
| `use-case.mmd` | Use Case Diagram with actors and system interactions | [View on Mermaid Live](https://mermaid.live) |
| `class-diagram.mmd` | UML Class Diagram for all data models | [View on Mermaid Live](https://mermaid.live) |
| `auth-flow-sequence.mmd` | Authentication workflow sequence diagrams | [View on Mermaid Live](https://mermaid.live) |
| `appointment-booking-sequence.mmd` | Appointment booking lifecycle sequence diagrams | [View on Mermaid Live](https://mermaid.live) |
| `payment-flow-sequence.mmd` | Payment processing sequence diagrams | [View on Mermaid Live](https://mermaid.live) |

## Diagram Descriptions

### Entity Relationship Diagram (ERD)
Shows the complete database schema with:
- 11 entity types (Parent, Doctor, Child, Appointment, Session, Order, Review, etc.)
- Cardinality relationships (one-to-many, many-to-many)
- Key attributes for each entity

### Use Case Diagram
Illustrates system functionality from user perspective:
- **Actors**: Parent, Doctor, Admin
- **Use Cases**: 37 total across 8 categories
  - Authentication (signup, login, password reset)
  - Child Management (add, update, view children)
  - Appointments (create, book, confirm, cancel)
  - AI Screening (questions, predictions, chat)
  - Sessions (create, track, review)
  - Payments (checkout, webhooks, history)
  - Reviews (rate doctors, view ratings)
  - Resources (education, pharmacy, charity)

### Class Diagram
UML representation of all Mongoose models:
- 13 classes with attributes and data types
- Methods and virtuals
- Inheritance relationships (Doctor extends Parent)
- References between models

### Sequence Diagrams
Three critical workflows documented:

1. **Authentication Flow**: Signup → Email Verification → Login → Password Reset
2. **Appointment Booking Flow**: Create Slots → Browse → Book → Confirm → Cancel
3. **Payment Flow**: Web Checkout → Webhook → Mobile Payment Intent → Order Creation

## Editing Diagrams

To modify diagrams:

1. Edit the `.mmd` source file using any text editor
2. Test changes in [Mermaid Live](https://mermaid.live)
3. Commit the updated `.mmd` file
4. GitHub will automatically render the changes

## Mermaid Syntax

All diagrams use Mermaid syntax:
- `erDiagram` for ERDs
- `graph TD` for use case diagrams
- `classDiagram` for UML class diagrams
- `sequenceDiagram` for sequence diagrams

See [Mermaid documentation](https://mermaid.js.org/intro/) for syntax details.
