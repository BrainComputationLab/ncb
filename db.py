from mongokit import Document


class Controller(object):

    def bootstrap():
        pass


class User(Document):

    __collection__ = 'user'
