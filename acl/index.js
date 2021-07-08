'use strict';

/**
 * Module dependencies
 */
var acl = require('acl')
const { USERS } = require('../constant/index');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Permissions
 */
acl.allow([{
    roles: [USERS.ROLE.ADMIN],
    allows: [{
        resources: '/apis/users/',
        permissions: '*'
    }, {
        resources: '/apis/users/:_id',
        permissions: '*'
    }, {
        resources: '/apis/users/paging',
        permissions: ['post']
    }, {
        resources: '/apis/books/',
        permissions: '*'
    }, {
        resources: '/apis/books/:_id',
        permissions: '*'
    }, {
        resources: '/apis/categories/',
        permissions: '*'
    }, {
        resources: '/apis/categories/paging',
        permissions: ['post']
    }, {
        resources: '/apis/categories/:_id',
        permissions: '*'
    }]
}, {
    roles: [USERS.ROLE.CONTRIBUTOR],
    allows: [{
        resources: '/apis/books/',
        permissions: '*'
    }, {
        resources: '/apis/users/',
        permissions: ['get']
    }, {
        resources: '/apis/categories/paging',
        permissions: ['post']
    }]
}, {
    roles: [USERS.ROLE.NORMAL],
    allows: [{
        resources: '/apis/books',
        permissions: ['get']
    }, {
        resources: '/apis/users/only',
        permissions: ['get']
    },{
        resources: '/apis/categories/paging',
        permissions: ['post']
    }]
}
]);

module.exports = acl;