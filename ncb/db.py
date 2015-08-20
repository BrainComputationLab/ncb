from __future__ import unicode_literals, print_function

from uuid import uuid4
from datetime import datetime, timedelta

from flask.sessions import SessionInterface, SessionMixin
from werkzeug.datastructures import CallbackDict
from pymongo import MongoClient

import sys

class MongoSession(CallbackDict, SessionMixin):
    def __init__(self, initial=None, sid=None):
        CallbackDict.__init__(self, initial)
        self.sid = sid
        self.modified = False


class MongoSessionInterface(SessionInterface):
    def __init__(self, host='localhost', port=27017, db='', collection='sessions'):
        client = MongoClient(host, port)
        self.store = client[db][collection]

    def open_session(self, app, request):
        sid = request.cookies.get(app.session_cookie_name)
        if sid:
            stored_session = self.store.find_one({'sid' : sid})
            if stored_session:
                if stored_session.get('expiration') > datetime.utcnow():
                    return MongoSession(initial=stored_session['data'], sid=stored_session['sid'])

        sid = str(uuid4())
        return MongoSession(sid=sid)

    def save_session(self, app, session, response):
        domain = self.get_cookie_domain(app)
        if not session:
            response.delete_cookie(app.session_cookie_name, domain=domain)

        exp_time = self.get_expiration_time(app, session)

        expiration = exp_time if exp_time else datetime.utcnow() + timedelta(hours=1)

        self.store.update_one({'sid' : session.sid},
                              {'$set' : {'sid' : session.sid, 'data' : session, 'expiration' : expiration}}, True)

        response.set_cookie(app.session_cookie_name, session.sid, expires=exp_time, httponly=True, domain=domain)


class MongoAuthenticator(object):
    def __init__(self, host='localhost', port=27017, db='', collection='users'):
        client = MongoClient(host, port)
        self.store = client[db][collection]

    def add_user(self, username, password):
        self.store.update_one({'username' : username},
                              {'$set' : {'username' : username, 'password' : password}}, True)

    def authenticate_user(self, username, password):
        return self.store.find_one({'username' : username, 'password' : password}) is not None

#print(dir(MongoSessionInterface), file=sys.stderr)