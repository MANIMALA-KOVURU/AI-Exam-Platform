from pathlib import Path
import struct
from typing import Dict, List, Tuple
import zlib

from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import get_settings
from .models import Question, QuestionAttachment, QuestionOption, QuestionType, Subject, User

DEFAULT_SEED_COUNT = 30
UPLOAD_ROOT = Path(get_settings().upload_dir) if get_settings().upload_dir else Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)

def _sample_png(subject_code: str, number: int) -> bytes:
    width, height = 320, 180
    pixels = bytearray()
    accent = (40 + (number * 17) % 170, 100 + (number * 11) % 100, 210)
    for y in range(height):
        pixels.append(0)
        for x in range(width):
            in_box = (35 <= x <= 125 and 55 <= y <= 125) or (195 <= x <= 285 and 55 <= y <= 125)
            line = (155 <= x <= 165 and 78 <= y <= 102) or (145 <= x <= 180 and 88 <= y <= 92)
            if in_box:
                pixels.extend(accent)
            elif line:
                pixels.extend((20, 35, 60))
            else:
                pixels.extend((238, 245, 255))

    def chunk(name: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + name + data + struct.pack(">I", zlib.crc32(name + data) & 0xffffffff)

    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(bytes(pixels), 9)) + chunk(b"IEND", b"")


SAMPLE_PDF = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 59>>stream\nBT /F1 18 Tf 72 720 Td (Seeded subject case study) Tj ET\nendstream\nendobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n"

SUBJECT_CONTENT: Dict[str, Dict[str, List[Tuple[str, str]]]] = {
    "DBMS": {
        "concepts": [
            ("primary keys", "uniquely identify each row in a relation"), ("foreign keys", "reference a key in another relation"),
            ("2NF", "removes partial dependency on part of a composite key"), ("3NF", "removes transitive dependency"),
            ("ACID atomicity", "makes a transaction all-or-nothing"), ("serializability", "preserves the effect of a serial schedule"),
            ("B-tree indexes", "support efficient ordered lookup and range scans"), ("INNER JOIN", "returns rows with matching values on both sides"),
            ("CHECK constraints", "restrict values according to a predicate"), ("ER diagrams", "model entities, attributes, and relationships"),
        ],
        "short": [("What is a primary key?", "A primary key is a minimal column set that uniquely identifies every row."), ("What is normalization?", "Normalization organizes relations to reduce redundancy and update anomalies."), ("What does ACID atomicity mean?", "Atomicity means every transaction operation succeeds together or none is applied."), ("What is an index?", "An index is an auxiliary structure that speeds lookup at the cost of storage and write work.")],
        "long": [("Explain 1NF, 2NF, and 3NF with examples.", "Describe atomic values, removal of partial dependencies, and removal of transitive dependencies.", "Award marks for definitions, dependency reasoning, and a correct example."), ("Explain transaction isolation and serializability.", "Isolation controls interference between concurrent transactions; serializability makes a concurrent schedule equivalent to a serial one.", "Award marks for schedules, conflicts, and the serializability guarantee."), ("Compare clustered and non-clustered indexes.", "A clustered index determines row order while a non-clustered index stores separate references to rows.", "Award marks for storage layout, lookup behavior, and trade-offs."), ("Explain relational joins and their use cases.", "Joins combine rows using related attributes; common forms include inner, left, right, and full joins.", "Award marks for join semantics and an accurate example.")],
    },
    "OS": {
        "concepts": [("process control blocks", "store the state and scheduling information for a process"), ("context switches", "save one execution context and restore another"), ("round-robin scheduling", "gives each ready process a fixed time quantum"), ("priority inversion", "lets a low-priority task delay a higher-priority task"), ("deadlock prevention", "breaks at least one necessary deadlock condition"), ("semaphores", "coordinate access to shared resources"), ("paging", "maps fixed-size virtual pages to physical frames"), ("virtual memory", "allows programs to use an address space larger than physical memory"), ("inode tables", "store file metadata and block references"), ("system calls", "provide a controlled interface from programs to the kernel")],
        "short": [("What is a process?", "A process is a program in execution together with its state and resources."), ("What is a thread?", "A thread is a schedulable execution path within a process."), ("What is paging?", "Paging divides virtual memory and physical memory into fixed-size pages and frames."), ("What is a deadlock?", "A deadlock occurs when processes wait forever for resources held by one another.")],
        "long": [("Explain process scheduling algorithms.", "Compare FCFS, SJF, priority, and round-robin scheduling using waiting and response time.", "Award marks for algorithm steps, metrics, and trade-offs."), ("Explain the four necessary conditions for deadlock.", "Mutual exclusion, hold and wait, no preemption, and circular wait are jointly necessary.", "Award marks for all four conditions and a prevention strategy."), ("Explain virtual memory and page replacement.", "Virtual memory maps pages through a page table; replacement algorithms choose a frame when a page fault needs space.", "Award marks for page faults, tables, and replacement reasoning."), ("Explain file-system allocation methods.", "Contiguous, linked, and indexed allocation organize file blocks with different access and fragmentation properties.", "Award marks for layout, access, and fragmentation comparison.")],
    },
    "JAVA": {
        "concepts": [("encapsulation", "keeps state private behind a public class interface"), ("inheritance", "derives a class from an existing class"), ("polymorphism", "allows one interface to represent different implementations"), ("method overloading", "uses the same method name with different parameter lists"), ("method overriding", "supplies a subclass implementation of an inherited method"), ("checked exceptions", "must be caught or declared by the compiler"), ("interfaces", "define contracts that classes can implement"), ("ArrayList", "provides a resizable indexed collection"), ("JVM bytecode", "runs on a virtual machine across platforms"), ("synchronized methods", "coordinate monitor access between threads")],
        "short": [("What is method overloading?", "Overloading defines methods with the same name and different parameter lists."), ("What is the JVM?", "The JVM executes Java bytecode and provides runtime services such as memory management."), ("What is an interface?", "An interface defines a contract that implementing classes must fulfill."), ("What is garbage collection?", "Garbage collection reclaims heap objects that are no longer reachable.")],
        "long": [("Explain inheritance and polymorphism in Java.", "Inheritance reuses structure and polymorphism dispatches behavior through a common type.", "Award marks for syntax, dynamic dispatch, and a suitable example."), ("Explain Java exception handling.", "try, catch, finally, throw, and throws support controlled recovery and propagation.", "Award marks for checked versus unchecked exceptions and flow."), ("Compare Java collections such as List, Set, and Map.", "List preserves ordered duplicates, Set enforces uniqueness, and Map associates keys with values.", "Award marks for interfaces, examples, and complexity considerations."), ("Explain Java thread synchronization.", "Synchronization protects shared state using intrinsic monitors or concurrency utilities.", "Award marks for race conditions, mutual exclusion, and safe design.")],
    },
    "PYTHON": {
        "concepts": [("lists", "store an ordered mutable sequence"), ("tuples", "store an ordered immutable sequence"), ("dictionaries", "map hashable keys to values"), ("sets", "store unique elements with set operations"), ("list comprehensions", "build lists from compact iteration and filtering"), ("generators", "produce values lazily with iteration"), ("decorators", "wrap functions to extend their behavior"), ("exceptions", "represent and handle runtime error conditions"), ("modules", "organize reusable Python definitions"), ("context managers", "guarantee setup and cleanup around a block")],
        "short": [("What is a Python dictionary?", "A dictionary stores key-value pairs and provides average constant-time key lookup."), ("What is a list comprehension?", "A list comprehension creates a list from an iterable with optional filtering."), ("What is a generator?", "A generator yields values lazily and preserves execution state between iterations."), ("What is a module?", "A module is a Python file that groups reusable code and can be imported.")],
        "long": [("Explain Python object-oriented programming.", "Classes define state and behavior; inheritance, composition, encapsulation, and polymorphism organize objects.", "Award marks for class design, reuse, and a valid Python example."), ("Explain Python exception handling and custom exceptions.", "try and except handle failures while raise and custom exception classes communicate domain errors.", "Award marks for control flow, cleanup, and meaningful exception design."), ("Compare lists, tuples, sets, and dictionaries.", "They differ in ordering, mutability, uniqueness, and key-based access.", "Award marks for accurate properties and use cases."), ("Explain iterators, generators, and lazy evaluation.", "Iterators expose next values and generators implement lazy production with yield.", "Award marks for memory behavior and iteration protocol.")],
    },
    "DSA": {
        "concepts": [("binary search", "finds an item in sorted data by halving the search interval"), ("hash tables", "use a hash function to provide average constant-time lookup"), ("stacks", "follow last-in-first-out ordering"), ("queues", "follow first-in-first-out ordering"), ("linked lists", "connect nodes through references"), ("heaps", "maintain a priority at the root"), ("quicksort", "partitions around a pivot recursively"), ("breadth-first search", "explores a graph level by level"), ("AVL trees", "rebalance binary search trees using rotations"), ("dynamic programming", "stores overlapping subproblem results")],
        "short": [("What is a stack?", "A stack is a LIFO data structure supporting push and pop operations."), ("What is a queue?", "A queue is a FIFO data structure supporting enqueue and dequeue operations."), ("What is recursion?", "Recursion solves a problem by calling the same algorithm on a smaller instance."), ("What is hashing?", "Hashing maps keys to table positions using a hash function.")],
        "long": [("Explain tree traversal techniques.", "Preorder, inorder, postorder, and level-order traversals visit tree nodes in different useful sequences.", "Award marks for orders, algorithms, and use cases."), ("Compare sorting algorithms.", "Insertion sort, merge sort, quicksort, and heap sort trade simplicity, stability, and time complexity.", "Award marks for complexity and behavior comparison."), ("Explain graph traversal with BFS and DFS.", "BFS uses a queue for layers while DFS uses a stack or recursion to explore depth.", "Award marks for algorithms, visited tracking, and applications."), ("Explain dynamic programming with an example.", "Dynamic programming combines optimal substructure with memoization or tabulation to avoid repeated work.", "Award marks for recurrence, base case, and complexity.")],
    },
}

TYPE_SEQUENCE = [
    "mcq", "mcq", "multi_select", "short_answer", "mcq", "image_upload", "multi_select", "short_answer", "mcq", "csv_upload",
    "mcq", "multi_select", "long_answer", "image_upload", "mcq", "short_answer", "pdf_upload", "multi_select", "long_answer", "mcq",
    "mcq", "multi_select", "long_answer", "short_answer", "image_upload", "pdf_upload", "csv_upload", "long_answer", "mcq", "mcq",
]


def _write_sample_attachment(subject_code: str, number: int, suffix: str, content: bytes) -> QuestionAttachment:
    stored_name = f"seed-{subject_code.lower()}-{number}{suffix}"
    path = UPLOAD_ROOT / stored_name
    if not path.exists():
        path.write_bytes(content)
    mime = {".png": "image/png", ".pdf": "application/pdf", ".csv": "text/csv"}[suffix]
    return QuestionAttachment(file_name=f"{subject_code.lower()}-sample-{number}{suffix}", stored_name=stored_name, file_type=mime, file_url=f"/uploads/{stored_name}", file_size=path.stat().st_size)


def _build_seed_question(subject_code: str, profile: Dict[str, List[Tuple[str, str]]], number: int, question_type: str, admin_id: str) -> Question:
    difficulty = "EASY" if number <= 10 else "MEDIUM" if number <= 20 else "HARD"
    concepts = profile["concepts"]
    concept, explanation = concepts[(number - 1) % len(concepts)]
    question = Question(seed_key=f"{subject_code}-{number:02d}", subject_id="", question_type=question_type, question_text="", difficulty=difficulty, marks=1 if difficulty == "EASY" else 2 if difficulty == "MEDIUM" else 5, created_by=admin_id)
    if question_type == QuestionType.mcq.value:
        question.question_text = f"Which statement best describes {concept} in {subject_code}?"
        options = [explanation, "It is unrelated to software systems", "It only describes a hardware voltage", "It is a user-interface color rule"]
        question.explanation = f"The correct statement is that {concept} {explanation}."
        question._seed_options = [(option, index == 0) for index, option in enumerate(options)]
    elif question_type == QuestionType.multi_select.value:
        question.question_text = f"Which statements are relevant to {concept} in {subject_code}?"
        options = [explanation, f"{concept} is used in practical {subject_code} systems", "It has no relationship to computing", "It is a database password"]
        question._seed_options = [(option, index < 2) for index, option in enumerate(options)]
        question.marks = 2
    elif question_type == QuestionType.short_answer.value:
        prompt, answer = profile["short"][(number - 1) % len(profile["short"])]
        question.question_text = prompt
        question.expected_answer = answer
        question.marks = 2
    elif question_type == QuestionType.long_answer.value:
        prompt, answer, criteria = profile["long"][(number - 1) % len(profile["long"])]
        question.question_text = prompt
        question.model_answer = answer
        question.evaluation_criteria = criteria
        question.marks = 5
    else:
        label = {"image_upload": "diagram", "pdf_upload": "case study PDF", "csv_upload": "sample CSV dataset"}[question_type]
        question.question_text = f"Use the attached {label} to analyze this {subject_code} scenario involving {concept}."
        question.marks = 3 if question_type == "image_upload" else 5
    return question


def ensure_default_questions(db: Session) -> None:
    admin = db.execute(select(User).where(User.email == "admin@aiexamplatform.com")).scalar_one_or_none()
    if admin is None:
        return
    subjects = {subject.code: subject for subject in db.execute(select(Subject)).scalars().all()}
    for subject_code, profile in SUBJECT_CONTENT.items():
        subject = subjects.get(subject_code)
        if subject is None:
            continue
        existing_count = db.query(Question).filter(Question.subject_id == subject.id).count()
        if existing_count >= DEFAULT_SEED_COUNT:
            continue
        for number, question_type in enumerate(TYPE_SEQUENCE, start=1):
            seed_key = f"{subject_code}-{number:02d}"
            if db.execute(select(Question).where(Question.seed_key == seed_key)).scalar_one_or_none() is not None:
                continue
            if db.query(Question).filter(Question.subject_id == subject.id).count() >= DEFAULT_SEED_COUNT:
                break
            question = _build_seed_question(subject_code, profile, number, question_type, admin.id)
            question.subject_id = subject.id
            db.add(question)
            db.flush()
            for option_index, (option_text, is_correct) in enumerate(getattr(question, "_seed_options", [])):
                db.add(QuestionOption(question_id=question.id, option_key=chr(65 + option_index), option_text=option_text, is_correct=is_correct))
            if question_type == QuestionType.image_upload.value:
                db.add(_write_sample_attachment(subject_code, number, ".png", _sample_png(subject_code, number)))
                db.flush()
                db.query(QuestionAttachment).filter(QuestionAttachment.file_url == f"/uploads/seed-{subject_code.lower()}-{number}.png").update({"question_id": question.id})
            elif question_type == QuestionType.pdf_upload.value:
                db.add(_write_sample_attachment(subject_code, number, ".pdf", SAMPLE_PDF))
                db.flush()
                db.query(QuestionAttachment).filter(QuestionAttachment.file_url == f"/uploads/seed-{subject_code.lower()}-{number}.pdf").update({"question_id": question.id})
            elif question_type == QuestionType.csv_upload.value:
                csv_content = f"subject,topic,value\n{subject_code},{profile['concepts'][(number - 1) % len(profile['concepts'])][0]},42\n"
                db.add(_write_sample_attachment(subject_code, number, ".csv", csv_content.encode("utf-8")))
                db.flush()
                db.query(QuestionAttachment).filter(QuestionAttachment.file_url == f"/uploads/seed-{subject_code.lower()}-{number}.csv").update({"question_id": question.id})
    db.commit()
