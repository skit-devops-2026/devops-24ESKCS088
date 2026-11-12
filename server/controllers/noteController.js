const { Note } = require('../models');

// @desc    Get all notes for user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    try {
        const query = {
            $or: [
                { user: req.user._id },
                { userId: req.user._id },
                { userEmail: req.user.email }
            ]
        };

        if (req.query.subject && req.query.subject !== 'all') {
            query.subject = req.query.subject;
        }
        if (req.query.pinned === 'true') {
            query.pinned = true;
        }
        if (req.query.favorite === 'true') {
            query.favorite = true;
        }
        if (req.query.search) {
            query.$and = [
                {
                    $or: [
                        { title: { $regex: req.query.search, $options: 'i' } },
                        { content: { $regex: req.query.search, $options: 'i' } },
                        { tags: { $regex: req.query.search, $options: 'i' } }
                    ]
                }
            ];
        }

        // Pinned notes first, then newest
        const notes = await Note.find(query).sort({ pinned: -1, createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    try {
        const { title, subject, content, tags, type, fileName, fileData, fileSize } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Please provide a note title' });
        }
        if (!subject) {
            return res.status(400).json({ error: 'Please provide a subject' });
        }

        const note = await Note.create({
            user: req.user._id,
            userId: req.user._id,
            userEmail: req.user.email,
            title: title.trim(),
            subject: subject.trim(),
            content: content || '',
            tags: tags || '',
            type: type || 'text',
            fileName: fileName || '',
            fileData: fileData || '',
            fileSize: fileSize || '',
            pinned: req.body.pinned || false,
            favorite: req.body.favorite || false
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
    try {
        const note = await Note.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Toggle pin note
// @route   PATCH /api/notes/:id/pin
// @access  Private
const togglePin = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        note.pinned = !note.pinned;
        await note.save();
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Toggle favorite note
// @route   PATCH /api/notes/:id/favorite
// @access  Private
const toggleFavorite = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        note.favorite = !note.favorite;
        await note.save();
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json({ message: 'Note deleted successfully', id: req.params.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getNotes,
    createNote,
    getNoteById,
    updateNote,
    togglePin,
    toggleFavorite,
    deleteNote
};
