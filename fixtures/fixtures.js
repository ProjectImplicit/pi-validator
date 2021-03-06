/* eslint-env node */
/* eslint no-console: "off"*/

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var upload  = require('multer')(); // for file uploads
var fs = require('fs');
var isMac = process.platform === 'darwin';

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
var adminRouter = express.Router();
var implicitRouter = express.Router();

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

router.get('/is_loggedin', (req,res) => res.json({"timeoutInSeconds":3600,"role":"SU","isloggedin":true}));

router.get('/studies', (req,res)=>{
    res.json({studies: [
        {id:'asd1', name:'Study 1', permission: 'owner', tags: createTags()},
        {id:'asd2', name:'Study 2', is_public: true, tags:[]},
        {id:'asd3', name:'Study 3', permission: 'read_only', tags: createTags()}
    ]});
});
function createTags(){
    var tags = [];
    while (0.6 > Math.random()) tags.push(randomTag());
    return tags;
}
function randText(){return (0|Math.random()*9e6).toString(36);}
function randomTag(args){return {id: Math.random(), color:Math.floor(Math.random()*16777215).toString(16) , text: randText(), used: args && args.hasUsed && Math.random() > 0.5};}

router
    .get('/studies/:id', (req,res)=>res.json(1))
    .delete('/studies/:id', (req,res)=>res.json(1))
    .post('/studies/:id', (req,res)=>res.json(1))
    .put('/studies/:id', (req,res)=>res.json(1));

/*
 * Tags
 */
router.get('/studies/:studyId/tags', (req,res)=>{
    var tags = [];
    while (0.9 > Math.random()) tags.push(randomTag({hasUsed:true}));
    res.json({tags:tags});
});
router.post('/studies/:studyId/tags/:tagId', (req,res)=>res.json(1));
router.delete('/studies/:studyId/tags/:tagId', (req,res)=>res.json(1));

router.get('/tags', (req,res)=> res.json({tags:createTags()}));
router.post('/tags', (req,res)=> res.json(randomTag()));
router.delete('/tags/:tagId', (req,res)=> res.json(1));

router.get('/studies/:studyId/collaboration', (req,res)=>{
    res.json({
        study_name: 'mystudy',
        is_public: Math.random() > 0.5,
        users: [
            {USERNAME:'asd1', PERMISSION:'owner',USER_ID:1234},
            {USERNAME:'asd2', PERMISSION:'owner',USER_ID:12},
            {USERNAME:'qwe2', PERMISSION:'readonly',USER_ID:12342}
        ]
    });
});


var files = isMac
    ? [
        {
            id: 'kt.jst',
            path: 'jt.jst',
            url: '/test/kt.jst',
            noDel: true
        },
        {
            id: 'iatExtenssion.js',
            path: 'iatExtenssion.js',
            url: '/test/iatExtenssion.js',
            noDel: true
        },
        {
            id: 'aaa.pdf',
            path: 'aaa.pdf',
            url: '/test/aaa.pdf'
        },
        {
            id: 'example.js',
            path: 'example.js',
            url: '/test/example.js'
        },
        {
            id: 'exp.xml',
            path: 'exp.xml',
            url: '/test/exp.xml'
        },
        {
            id: 'study.expt.xml',
            path: 'study.expt.xml',
            url: '/test/study.expt.xml'
        }
    ]
    : [
        {
            'id': 'carlee.js',
            'path': 'carlee.js',
            'url': '/test/carlee.js'
        },
        {
            'id': 'imageTest.js',
            'path': 'imageTest.js',
            'url': '/test/imageTest.js'
        },
        {
            'id': 'example.js',
            'path': 'example.js',
            'url': '/test/example.js'
        },
        {
            'id': 'left.jst',
            'path': 'left.jst',
            'url': '/test/templates/left.jst'
        },
        {
            'id': 'wf3_nc.jpg',
            'path': 'wf3_nc.jpg',
            'url': '/test/images/wf3_nc.jpg'
        }
    ];

files.push({id:'images', path:'images', url:'/test/images', isDir:true, files: [
    {
        'id': 'wm1_nc.jpg',
        'path': 'images/wm1_nc.jpg',
        'url': '/test/images/wm1_nc.jpg'
    },
    {
        'id': 'bf14_nc.jpg',
        'path': 'images/bf14_nc.jpg',
        'url': '/test/images/bf14_nc.jpg'
    }
]});

files.push({id:'par', path:'par', url:'/test/par', isDir:true, files: [
    {id: 'sub', path: 'par/sub', url: '/test/par/sub', isDir: true, files: [
        {
            'id': 'wm1_ncasdf.jpg',
            'path': 'par/sub/wm1_nc.jpg',
            'url': '/test/par/sub/wm1_nc.jpg'
        }
    ]}
]});

files.push({id:'someFile.grg', path:'someFile.grg', url:'/test/someFile.grg'});

router.route('/files/:studyId')
    .get((req,res)=>{
        setTimeout(function(){
            res.json({
                is_readonly: Math.random() < 0.1,
                study_name: 'Cool name',
                base_url: 'base url...',
                files: files
            });
        }, 0);
    });

router.route('/files/:studyId/file')
    // create file
    .post(upload.array('files'), (req,res)=>{
        res.json({id: req.body.name, path: req.body.name, url:`/test/${req.body.name}`});
    });


var uploadMiddle =  (req,res) => {
    var path = req.params.path || '';
    var resp = req.files.map(f => ({id: Math.random(), path: path === '' ? f.originalname : path + '/' + f.originalname}));
    res.json(resp);
};
router.route('/files/:studyId/upload/').post(upload.any(),uploadMiddle);
router.route('/files/:studyId/upload/:path').post(upload.any(),uploadMiddle);

router.route('/files/:studyId/file/:id')
    // get file data
    .get((req,res)=>{
        var file = files.find(f => f.id == req.params.id);

        if (!file) return res.status(404).json({message:'File not found'});

        if (/(jst|html|xml|js)$/.test(file.url)){
            fs.readFile('..' + file.url, function read(err, data) {
                if (err) {throw err;}
                res.json(Object.assign({content: new String(data)},file));
            });
        } else {
            res.json(file);
        }
    })
    // update file
    .put((req, res)=>{
        res.end();
    })
    // delete file
    .delete((req,res)=>{
        if (files.some(f => f.id == req.params.id && f.noDel)) {
            res.status(403).json({message:'del ' + req.params.id + ' failed'});
        }
        res.end();
    });


router.route('/files/:studyId/file/:id/move')
    .put((req, res) => {
        res.json({id:req.body.path, url: req.body.url});
    });

router.route('/files/:studyId/download')
    .post((req, res)=> res.json({url: '/test/iatSound.js'}));

router.route('/files/:studyId')
    .delete((req, res) => res.end())

router.route('/studies/:studyId/deploy')
    .get((req,res) => res.json({
        "have_rule_file":true,
        "study_name": 'BIATGood1',
        "folder":"yba\/BIATGood1\/",
        "user_name":"yoav",
        "researcher_email":"baranany@bgu.ac.il",
        "researcher_name":"Yoav Bar-Ana",
        "experiment_file":[
            {"file_id":"noseklab.yba.BIATGood.0001", "file_name":"BIATGood1.expt.xml"},
            {"file_id":"noseklab.yba.BIATGood.0001","file_name":"dBIATGood1.expt.xml"}
        ],
        "study_name":"BIATGood1"
    }));

adminRouter.route('/studyData')
    .post((req,res)=> {
        switch (req.body.action) {
            case 'getAllPoolStudies':
                var data = [];
                for (var i=0; i<10; i++){
                    data.push({
                        studyId:(0|Math.random()*9e6).toString(36),
                        studyUrl:(0|Math.random()*9e6).toString(36),
                        rulesUrl:(0|Math.random()*9e6).toString(36),
                        autopauseUrl: (0|Math.random()*9e6).toString(36),
                        targetCompletions: Math.random() * 100,
                        startedSessions: Math.random() * 100,
                        completedSessions: Math.random() * 100,
                        creationDate:new Date() * Math.random(),
                        studyStatus: Math.random()>0.5?'R':'P',
                        canStop:Math.random()>0.5,
                        canReset:Math.random()>0.5,
                        canPause:Math.random()>0.5,
                        canUnpause:Math.random()>0.5
                    });
                }
                //res.status(403).json({message:'Oh crud'})
                res.json(data);
                break;
            case 'getLast100PoolUpdates':
                var data = [];
                for (var i=0; i<100; i++){
                    data.push({
                        studyId:(0|Math.random()*9e6).toString(36),
                        newStatus: ['R','P','S'][Math.floor(Math.random()*3)],
                        updaterId:(0|Math.random()*9e6).toString(36),
                        creationDate:new Date() * Math.random()
                    });
                }
                res.json(data);

                break;
            case 'updateRulesTable':
            case 'updateStudyStatus':
                setTimeout(function(){
                    res.json({error:2});
                }, 1000);
                break;

            case 'getStudyId':
                setTimeout(function(){
                    res.json({studyId: 'cool studyId adn stuff'});
                }, 1000);
                break;

            case 'resetStudy':
                setTimeout(function(){
                    res.json({error:true, msg: 'Oy gevalt'});
                }, 1000);

                break;

            default:
                res.status(500).json({message:'oops something went awfully wrong - action not found'});

        }

    });

adminRouter.route('/DashboardData')
    .post(function(req,res){
        switch (req.body.action) {
            case 'getAllDownloads':
                var data = [];
                for (var i=0; i<10; i++){
                    data.push({
                        id: Math.random(),
                        studyId:(0|Math.random()*9e6).toString(36),
                        studyUrl: Math.random() < 0.7 ? (0|Math.random()*9e6).toString(36) : '',
                        db: Math.random() > 0.5 ? 'production' : 'development',
                        fileSize: Math.random() < 0.5 ? '' : '12Kb',
                        creationDate:new Date(new Date() * Math.random()),
                        startDate:new Date(new Date() * Math.random()),
                        endDate:new Date(new Date() * Math.random()),
                        studyStatus: ['R','C','X'][Math.floor(Math.random()*3)]
                    });
                }
                res.json(data);
                //res.status(500).send('asdsdf')
                break;
            case 'download':
                setTimeout(function(){
                    res.json({error:false, msg:'download error'});
                },4000);
                break;
            case 'removeDownload':
                res.send('');
                //res.json({eror:'true', mssg:'remove error'});
                break;
            default:
                res.status(500).res.json({message:'oops something went awfully wrong'});
        }
    });

router.route('/connect')
    .post(function(req,res){
        if (req.body.username === 'elad' && req.body.password === 'zlot') res.cookie('PiLogin', JSON.stringify({isLoggedin: true,role: 'SU'}));
        res.json(null);
    });

adminRouter.route('/logout')
    .post(function(req,res){
        res.cookie('PiLogin', JSON.stringify({}));
        res.json(null);
    });

adminRouter.route('/PITracking')
    .post(function(req, res){
        var firstRow = [];
        var data = [firstRow];
        for (var i=0; i<Math.random() * 10 + 1; i++){
            firstRow.push((0|Math.random()*9e6).toString(36));
        }

        for (i=0; i<Math.random() * 1000; i++){
            data.push(firstRow.map(function(){
                return (0|Math.random()*9e6).toString(36);
            }));
        }

        var STATISTICS = req.body.study === 'empty' ? '' : data.map(function(row){return row.join(',');}).join('\n');
        res.end(STATISTICS);
    });

implicitRouter.route('/PiManager')
    .post(function(req,res) {
        res.json(1)
    });



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /dashboard
app.use('/dashboard/dashboard', router);
app.use('/dashboard', adminRouter);
app.use('/implicit', implicitRouter);
app.use('/implicit/user/yba/wizards', express.static('fixtures/wizards'));
app.use('/implicit/common/all/js/pip/0.3', express.static('../pip'));
app.use('/implicit/common/all/js/quest/0.0', express.static('../quest'));
app.use(express.static('..'));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
