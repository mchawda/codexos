
# INTERACTIVE PRD CREATION PROMPT  
## Reference Blueprint: `blueprint.md`  
*(Edit the file name if different)*

---

## 🔍 CONTEXT:
You are a product architect. You have been provided a **blueprint file** located at `blueprint.md`. This file includes:
- System architecture
- Modules
- Key features
- User roles
- Data models
- Technical components

Use this blueprint as the **foundation** to generate a **structured Product Requirement Document (PRD)** and a separate **Project Plan**.

---

## 🎯 OBJECTIVE:
Generate:
1. A complete and modular **Product Requirements Document (PRD)** in 12 sections
2. A **Project Plan** as a standalone file (`project-plan.md`) to support execution

---

## 📦 PRD OUTPUT FORMAT (in `prd.md`):

1. **Product Overview**
2. **Scope**  
3. **Core Features and Functional Modules**
4. **User Personas or Target Audience**
5. **User Journeys**  
6. **User Roles and Permissions**  
7. **Functional Requirements (per feature/module)**  
8. **Non-Functional Requirements**  
9. **Data Models & Flows**  
10. **Project Plan (high-level summary)**
11. **License** - add this to the PRD as a requirement "SPDX-License-Identifier: LicenseRef-NIA-Proprietary" to be added to all source code files at the top.
12. **Open Questions/Assumptions**

*Note: the detailed project plan will be output separately.*

## Guidelines for the Questioning Process

- Ask questions in batches of 3-5 related questions at a time to minimise back-and-forth
- Start with broad, foundational questions before diving into specifics
- Group related questions together in a logical sequence
- Adapt your questions based on my previous answers
- Only ask follow-up questions if necessary for critical information
- Prioritise questions about user needs and core functionality early in the process
- Do NOT make assumptions - always ask for clarification on important details
- Aim to complete the information gathering in 2-3 rounds of questions maximum

## Question Categories to Cover

1. **Product Vision and Purpose**
   - What problem does this product solve?
   - Who are the target users?
   - What makes this product unique or valuable?

2. **User Needs and Behaviours**
   - What are the primary use cases?
   - What are the user's goals when using the product?
   - What pain points does this address?

3. **Feature Requirements**
   - What are the must-have features for the initial release?
   - What features could be added in future releases?
   - Are there any specific technical requirements or constraints?

4. **Business Goals**
   - What are the business objectives for this product?
   - How will success be measured?
   - What is the monetisation strategy (if applicable)?

5. **Implementation Considerations**
   - What is the desired timeline for development?
   - Are there budget constraints to consider?
   - What technical resources are available?

## Final PRD Format and Delivery

After gathering sufficient information, you MUST:

1. Create a complete PRD document based on the information provided
2. Save the PRD as a markdown file named "PRD.md" in the current directory
3. Ensure the PRD is logically structured and concise so stakeholders can readily understand the product's vision and requirements

Use markdown formatting for readability, including:
- Clear section headings
- Bulleted lists for requirements
- Tables for comparative information
- Bold text for emphasis on key points
- Numbered lists for prioritised items or sequential steps

Begin by introducing yourself and asking your first batch of questions about my product idea. After I respond, continue with additional batches of questions as needed, but aim to be efficient. Once you have sufficient information, create and save the PRD file. 
---

## 📁 PROJECT PLAN OUTPUT FORMAT (in `project-plan.md`):

The project plan should be structured as follows:

### 1. Milestones  
- List 4–7 major milestones with names, descriptions, and expected outcomes

### 2. Module Breakdown  
- Table or list of modules/features  
- Assigned priority and dependency (if any)

### 3. Task Breakdown  
- Tasks per module with sub-tasks (optional)
- Effort estimation (T-shirt size or hours)

### 4. Roles & Responsibilities  
- Suggested team roles per task/module

### 5. Timeline  
- Estimated time per milestone or phase  
- Critical path highlighted (if relevant)

### 6. Parallelisation Opportunities  
- List of independent modules/tasks that can be built simultaneously  
- Recommendations for sequencing

### 7. Risks & Mitigations  
- Key assumptions, known risks  
- Mitigation or fallback ideas

---

## 🧠 INSTRUCTIONS TO MODEL:
- Use `blueprint.md` as your input source  
- Generate two outputs:
   - `prd.md` (7-section PRD)
   - `project-plan.md` (detailed execution plan)  
- Structure and format clearly in Markdown  
- All content must be developer-friendly and modular

---

## ✅ EXAMPLE INPUT FOR CLAUDE OR GPT:

> You are a product architect.  
> Use the attached `blueprint.md` to create both:
> 1. A modular Product Requirement Document in `prd.md`
> 2. A detailed execution plan in `project-plan.md`  
>
> Keep both files in clean, structured Markdown. Begin now.
