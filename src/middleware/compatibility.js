// Route compatibility middleware for frontend
const routeAliases = {
    'POST /users/login': '/api/auth/login',
    'POST /users/verify-email': '/api/auth/verify-email',
    'POST /users/resend-verification': '/api/auth/resend-verification',
    'POST /users/request-password-reset': '/api/auth/request-password-reset',
    'POST /users/reset-password': '/api/auth/reset-password',
    'GET /users/google': '/api/auth/google',
    'GET /users/logout': '/api/auth/logout',
    'GET /users/current-user': '/api/auth/current-user',
    // Specific fix for register if needed, though prompt didn't explicitly ask for it, 
    // frontend uses /users/new_member in signup.html which maps to register
    'POST /users/new_member': '/api/users/register',
    // Verification alias
    'POST /users/verify': '/api/auth/verify-email',
    // Profile alias
    'GET /users/profile': '/api/auth/current-user'
};

module.exports = (req, res, next) => {
    const key = `${req.method} ${req.path}`; // Use req.path to ignore query params
    if (routeAliases[key]) {
        console.log(`🔄 Route alias: ${req.path} → ${routeAliases[key]}`);
        req.url = routeAliases[key]; // Update url to new path

        // Legacy Payload Transformation for Registration
        if (key === 'POST /users/new_member' && req.body) {
            console.log('🔄 Transforming legacy registration payload...');

            // Map fields
            if (req.body.name) {
                req.body.full_name = req.body.name;
                delete req.body.name;
            }
            if (req.body.program) {
                req.body.programme = req.body.program;
                delete req.body.program;
            }

            // Map experience level
            const levelMap = {
                'LOW': 'Beginner',
                'MID': 'Intermediate',
                'HIGH': 'Advanced'
            };
            if (req.body.level) {
                if (levelMap[req.body.level]) {
                    req.body.experience_level = levelMap[req.body.level];
                } else {
                    req.body.experience_level = 'Beginner';
                }
                delete req.body.level;
            }

            console.log('DEBUG Transformed Body:', JSON.stringify(req.body));
        }
    }
    next();
};
