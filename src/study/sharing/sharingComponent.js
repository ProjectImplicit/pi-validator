import {get_collaborations, remove_collaboration, add_collaboration, make_pulic} from './sharingModel';
import messages from 'utils/messagesComponent';

export default collaborationComponent;

let collaborationComponent = {
    controller(){
        let ctrl = {
            users:m.prop(),
            is_public:m.prop(),
            study_name:m.prop(),
            user_name:m.prop(''),
            permission:m.prop(''),
            loaded:false,
            col_error:m.prop(''),
            pub_error:m.prop(''),
            remove,
            do_add_collaboration,
            do_make_public
        };
        function load() {
            get_collaborations(m.route.param('studyId'))
                .then(response =>{ctrl.users(response.users);
                    ctrl.is_public(response.is_public);
                    ctrl.study_name(response.study_name);
                    ctrl.loaded = true;})
                .catch(error => {
                    ctrl.col_error(error.message);
                }).then(m.redraw);

        }
        function remove(user_id){
            messages.confirm({header:'Delete collaboration', content:'Are you sure?'})
                .then(response => {
                    if (response)
                        remove_collaboration(m.route.param('studyId'), user_id)
                            .then(()=> {
                                load();
                            })
                            .catch(error => {
                                ctrl.col_error(error.message);
                            })
                            .then(m.redraw);
                });
        }
        function do_add_collaboration(){
            messages.confirm({
                header:'Add a Collaborator',
                content: m.component({view: () => m('p', [
                    m('p', 'Enter collaborator\'s user name:'),
                    m('input.form-control', {placeholder: 'User name', value: ctrl.user_name(), onchange: m.withAttr('value', ctrl.user_name)}),
                    m('select.form-control', {value:ctrl.permission(), onchange: m.withAttr('value',ctrl.permission)}, [
                        m('option',{value:'', disabled: true}, 'Permission'),
                        m('option',{value:'can edit', selected: ctrl.permission() === 'can edit'}, 'Can edit'),
                        m('option',{value:'read only', selected: ctrl.permission() === 'read only'}, 'Read only')
                    ]),
                    m('p', {class: ctrl.col_error()? 'alert alert-danger' : ''}, ctrl.col_error())
                ])
                })})
                .then(response => {
                    if (response)
                        add_collaboration(m.route.param('studyId'), ctrl.user_name, ctrl.permission)
                        .then(()=>{
                            ctrl.col_error('');
                            load();
                        })
                        .catch(error => {
                            ctrl.col_error(error.message);
                            do_add_collaboration();
                        })
                        .then(m.redraw);
                });
        }
        function do_make_public(is_public){
            messages.confirm({okText: ['Yes, make ', is_public ? 'public' : 'private'], cancelText: ['No, keep ', is_public ? 'private' : 'public' ], header:'Are you sure?', content:m('p', [m('p', is_public
                                                                                ?
                                                                                'Making the study public will allow everyone to view the files. It will NOT allow others to modify the study or its files.'
                                                                                :
                                                                                'Making the study private will hide its files from everyone but you.'),
                m('span', {class: ctrl.pub_error()? 'alert alert-danger' : ''}, ctrl.pub_error())])})
                .then(response => {
                    if (response) make_pulic(m.route.param('studyId'), is_public)
                        .then(()=>{
                            ctrl.pub_error('');
                            load();
                        })
                        .catch(error => {
                            ctrl.pub_error(error.message);
                            do_make_public(is_public);
                        })
                        .then(m.redraw);
                });

        }
        load();
        return ctrl;
    },
    view(ctrl){
        return  !ctrl.loaded
            ?
            m('.loader')
            :
            m('.container.sharing-page', [
                m('.row',[
                    m('.col-sm-7', [
                        m('h3', [ctrl.study_name(), ': Sharing'])
                    ]),
                    m('.col-sm-5', [
                        m('button.btn.btn-secondary.btn-sm.m-r-1', {onclick:ctrl.do_add_collaboration}, [
                            m('i.fa.fa-plus'), '  Add a new collaborator'
                        ]),
                        m('button.btn.btn-secondary.btn-sm', {onclick:function() {ctrl.do_make_public(!ctrl.is_public());}}, ['Make ', ctrl.is_public() ? 'Private' : 'Public'])
                    ])
                ]),
                
                m('table', {class:'table table-striped table-hover'}, [
                    m('thead', [
                        m('tr', [
                            m('th', 'User name'),
                            m('th',  'Permission'),
                            m('th',  'Remove')
                        ])
                    ]),
                    m('tbody', [
                        ctrl.users().map(user => m('tr', [
                            m('td', user.USERNAME),
                            m('td', user.PERMISSION),
                            m('td', m('button.btn.btn-secondary', {onclick:function() {ctrl.remove(user.USER_ID);}}, 'Remove'))
                        ]))

                    ])
                ])
            ]);
    }
};