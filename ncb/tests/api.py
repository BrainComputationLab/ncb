import unittest
from ensure import ensure


class ApiTest(unittest.TestCase):

    def setUp(self):
        pass

    def test_stuff(self):
        ensure(1).equals(1)
