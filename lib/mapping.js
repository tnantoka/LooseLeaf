/* Mapping uri & view */

exports.get = function() {

  var mapping = {};

  mapping.uri = {
    // public
    // TODO: Redirect if no slash
    root: '/', 
    top: '/index/0/', 
    index: '/index/:offset/', 
    entry: '/entry/:id/', 
    comment: '/entry/:id/comment/', 
    comments: '/entry/:id/#comments', 
    category: '/category/:id/', 
    tag: '/tag/:tag/', 
    monthly: '/archive/:year/:month/', 
    calendar: '/calendar/:year/:month/', 
    daily: '/archive/:year/:month/:date/', 
    search: '/search',
    trackback: '/trackback/:id/',

    admin: {
      root: '/admin?', 
      login: '/admin/login/',
      logout: '/admin/logout/',
      index: '/admin/index/',
      ref: '/admin/login/?ref=' ,
      entry: {
        add: '/admin/entry/add/', 
        edit: '/admin/entry/edit/:id/', 
        list: '/admin/entry/list/', 
        remove: '/admin/entry/remove/:id/'
      }, 
      category: {
        add: '/admin/category/add/',
        list: '/admin/category/list/',
        edit: '/admin/category/edit/:id/',
        remove: '/admin/category/remove/:id/'
      },
      file: {
        add: '/admin/file/add/',
        list: '/admin/file/list/',
        confirm: '/admin/file/confirm/',
        remove: '/admin/file/remove/'
      },
      theme: {
        list: '/admin/theme/list/',
        edit: '/admin/theme/edit/'
      }
    }

  };

  mapping.view = {
    // public
    index: 'index', 
    entry: 'entry', 
    category: 'category',
    tag: 'category',
    monthly: 'archives',
    daily: 'archives',
    calendar: 'calendar',
    search: 'search',
    error: 'error',
    
    admin: {
      login: 'admin/login',
      index: 'admin/index',
      layout: 'layout', 
      entry: {
        form: 'admin/entryForm', 
        result: 'admin/entryResult', 
        list: 'admin/entryList', 
        confirm: 'admin/entryConfirm', 
        remove: 'admin/entryRemove' 
      },
      category: {
        list: 'admin/categoryList', 
        confirm: 'admin/categoryConfirm'
      },
      file: {
        list: 'admin/fileList', 
        confirm: 'admin/fileConfirm'
      },
      theme: {
        list: 'admin/themeList'
      }
    }    
  };
  
  return mapping;
}