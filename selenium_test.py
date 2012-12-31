import time
import unittest

from selenium import webdriver
from selenium.webdriver.common import by
from selenium.common import exceptions


class Error(Exception):
  pass


def wait_for_text(sel, element_id, text, timeout):
  start_time = time.time()
  timeout = timeout / 1000.0
  now = time.time()
  while (now - start_time <= timeout and
         sel.find_element_by_id(element_id).text != text):
    time.sleep(0.1)
    now = time.time()
  if start_time - now > timeout:
    raise Error(
      'Element %r did not have text %r within timeout period of %s ms',
      element_id, text, timeout)


def is_text_present(sel, text):
  try:
    el = sel.find_element_by_tag_name('body')
  except exceptions.NoSuchElementException:
    return False
  return text in el.text


class MavelousWebTest(unittest.TestCase):
  def setUp(self):
    self.driver = webdriver.Firefox()
    self.driver.implicitly_wait(30)
    self.base_url = "http://localhost:9999/"
    self.verificationErrors = []
    self.accept_next_alert = True
    self.driver.get(self.base_url)
    # FIXME(wiseman): This doesn't seem to work.
    #self.assertFalse(is_text_present(self.driver, 'DISARMED'))
    # So do this instead.
    # FIXME(wiseman): Except that this screws up the popovers somehow.
    self.driver.find_element_by_id('navbar-btn-mode').click()
    self.assertTrue(self.is_element_present(by.By.ID, 'flightmode-btn-arm'))

  def test_flight_mode_buttons(self):
    "Testing flight mode buttons"
    sel = self.driver
    sel.find_element_by_id('navbar-btn-mode').click()
    sel.find_element_by_id('flightmode-btn-rtl').click()
    wait_for_text(sel, 'navbar-btn-mode', 'RTL', 1000)
    sel.find_element_by_id('flightmode-btn-land').click()
    wait_for_text(sel, 'navbar-btn-mode', 'LAND', 1000)
    sel.find_element_by_id('flightmode-btn-loiter').click()
    wait_for_text(sel, 'navbar-btn-mode', 'LOITER', 1000)

  def test_gps_button(self):
    "Testing GPS button"
    sel = self.driver
    sel.find_element_by_id('navbar-btn-gps').click()
    self.assertTrue(is_text_present(sel, 'Satellites'))

  def is_element_present(self, how, what):
    try:
      self.driver.find_element(by=how, value=what)
    except exceptions.NoSuchElementException:
      return False
    return True

  def close_alert_and_get_its_text(self):
    try:
      alert = self.driver.switch_to_alert()
      if self.accept_next_alert:
        alert.accept()
      else:
        alert.dismiss()
      return alert.text
    finally:
      self.accept_next_alert = True

  def tearDown(self):
    sel = self.driver
    sel.quit()
    self.assertEqual([], self.verificationErrors)


if __name__ == "__main__":
  print 'Ensure that the simulated uav is ARMED.'
  unittest.main()
