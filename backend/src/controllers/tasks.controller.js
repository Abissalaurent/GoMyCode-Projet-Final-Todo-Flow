//Fonctions pour recupérer des tâches
export const getTasks = (req, res) => {
    try {
        res.status(200).json({ tasks: [] });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des tâches', error: error.message });
    }
};

//Fonction pour créer une nouvelle tâche
export const createTask = (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Le titre de la tâche est requis' });
        }
        res.status(201).json({ message: 'Tâche créée avec succès', task: { title, description } });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de la tâche', error: error.message });
    }
};