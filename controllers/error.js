exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        titulo: 'Pagina No Encontrada',
        path: '',
        autenticado: req.session.autenticado
    });
};

exports.get500 = (req, res, next) => {
    res.status(500).render('500', {
        titulo: 'Error!',
        path: '/500',
        autenticado: req.session.autenticado
    });
};