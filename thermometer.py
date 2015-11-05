import os
import glob
import time
import RPi.GPIO as GPIO
import json
from firebase import firebase

os.system('modprobe w1-gpio')
os.system('modprobe w1-therm')

firebase = firebase.FirebaseApplication('https://iot-homebrew.firebaseio.com', None)

base_dir = '/sys/bus/w1/devices/'
device_folder = glob.glob(base_dir + '28*')[0]
device_file = device_folder + '/w1_slave'

on_pin = 26
off_pin = 24

GPIO.setmode(GPIO.BOARD)
GPIO.setup(on_pin, GPIO.OUT)
GPIO.setup(off_pin, GPIO.OUT)

temp = 28
hysteresis = 0.5
power_is_on = False

content_type = {'X_CONTENT_TYPE': 'application/json'}

def read_temp_raw():
	f = open(device_file, 'r')
	lines = f.readlines()
	f.close()
	return lines

def power_on():
	global power_is_on
	power_is_on = True
	GPIO.output(on_pin, True)
	time.sleep(0.5)
	GPIO.output(on_pin, False)
	post_power(power_is_on)

def power_off():
	global power_is_on
	power_is_on = False
	GPIO.output(off_pin, True)
	time.sleep(0.5)
	GPIO.output(off_pin, False)
	post_power(power_is_on)

def read_temp():
	lines = read_temp_raw()

	while lines[0].strip()[-3:] != 'YES':
		time.sleep(0.2)
		lines = read_temp_raw()

	equals_pos = lines[1].find('t=')

	if equals_pos != -1:
		temp_string = lines[1][equals_pos+2:]
		temp_c = float(temp_string) / 1000.0
		temp_f = temp_c * 9.0 / 5.0 + 32.0
		return temp_c, temp_f

def post_temp(current_temp):
	global content_type
	temp_info = {"timestamp": time.time(), "temp": current_temp}
	firebase.post(url='/Temperatures', data=temp_info, headers=content_type)

def post_power(power):
	global content_type
	json_power = {"timestamp": time.time(), "state": power}
	firebase.post(url='/Power', data=json_power, headers=content_type)

GPIO.output(on_pin, False)
GPIO.output(off_pin, False)

print('Aloitetaan')
print('Laitefilu: ' + device_file)
while True:
	current_temp = read_temp()[0]
	post_temp(current_temp)
	if current_temp > (temp + hysteresis) and power_is_on == True:
		power_off()
	elif current_temp < (temp - hysteresis) and power_is_on == False:
		power_on()
	time.sleep(1)
