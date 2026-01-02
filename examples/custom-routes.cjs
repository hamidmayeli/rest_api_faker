// Example custom routes file (CommonJS)
module.exports = function(router) {
  router.get('/custom', (req, res) => {
    res.json({ message: 'This is a custom route!' });
  });

  router.post('/custom', (req, res) => {
    res.status(201).json({ message: 'Created custom resource', data: req.body });
  });
};
