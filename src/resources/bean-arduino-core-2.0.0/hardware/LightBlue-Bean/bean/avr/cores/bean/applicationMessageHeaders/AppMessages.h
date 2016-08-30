/**
  @headerfile:    AppMessages.h

  @mainpage     Application Messages

  Types that define the application messages.<BR><BR>

  Reference: @ref APP_MESSAGES <BR><BR>

  Copyright (C) 2014 Punch Through Design, LLC.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"),
  to deal in the Software without restriction, including without limitation the
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
  sell copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

#ifndef APPMESSAGES_H
#define APPMESSAGES_H

#include "AppMessageTypes.h"

// Serial Message Defines and Types
#define APP_MSG_MAX_LENGTH                 (66)
#define APP_MSG_RESPONSE_BIT               (0x80)
#define APP_MSG_FIELD_SIZE_MAJOR           (1)
#define APP_MSG_FIELD_SIZE_MINOR           (1)
#define APP_MSG_ID_SIZE                    (APP_MSG_FIELD_SIZE_MAJOR + APP_MSG_FIELD_SIZE_MINOR)
#define SERIAL_FIELD_SIZE_LENGTH           (1)
#define SERIAL_FIELD_SIZE_RESERVED         (1)
#define SERIAL_FIELD_SIZE_CRC              (2)
#define SERIAL_MSG_SIZE_HEADER             (SERIAL_FIELD_SIZE_LENGTH + SERIAL_FIELD_SIZE_RESERVED)
#define SERIAL_MSG_SIZE_FOOTER             (SERIAL_FIELD_SIZE_CRC)
#define SERIAL_MSG_SIZE_OVERHEAD           (SERIAL_MSG_SIZE_HEADER + SERIAL_MSG_SIZE_FOOTER)

#define UT_CHAR_START                      (0x7E)
#define UT_CHAR_ESC                        (0x7D)
#define UT_CHAR_END                        (0x7F)

// XOR the byte to escape it
#define HDLC_ESCAPE_XOR                    (0x20)

// Minimum message payload lengths sans header size
#define MSG_MIN_LEN_SERIAL_DATA            (0)
#define MSG_MIN_LEN_BT_SET_ADV             (2)
#define MSG_MIN_LEN_BT_SET_CONN            (2)
#define MSG_MIN_LEN_BT_SET_LOCAL_NAME      (1)
#define MSG_MIN_LEN_BT_SET_PIN             (3)
#define MSG_MIN_LEN_BT_ENABLE_PAIRING_PIN  (1)
#define MSG_MIN_LEN_BT_SET_TX_PWR          (1)
#define MSG_MIN_LEN_BT_GET_CONFIG          (0)
#define MSG_MIN_LEN_BT_SET_CONFIG          (sizeof(BT_RADIOCONFIG_T))
#define MSG_MIN_LEN_BT_ADV_ONOFF           (sizeof(BT_ADV_ONOFF_T))
#define MSG_MIN_LEN_BT_SET_SCRATCH         (2)
#define MSG_MIN_LEN_BT_GET_SCRATCH         (1)
#define MSG_MIN_LEN_BT_GET_STATES          (0)
#define MSG_MIN_LEN_BT_RESTART             (0)
#define MSG_MIN_LEN_BT_DISCONNECT          (0)
#define MSG_MIN_LEN_BT_SET_CONFIG_NOSAVE   (sizeof(BT_RADIOCONFIG_T))
#define MSG_MIN_LEN_BT_END_GATE            (0)
#define MSG_MIN_LEN_GATT_SET_GATT          (sizeof(ADV_SWITCH_ENABLED_T))
#define MSG_MIN_LEN_GATT_GET_GATT          (0)
#define MSG_MIN_LEN_BL_CMD_START           (1)
#define MSG_MIN_LEN_BL_FW_BLOCK            (0)
#define MSG_MIN_LEN_BL_STATUS              (0)
#define MSG_MIN_LEN_BL_GET_META            (0)
#define MSG_MIN_LEN_CC_LED_WRITE           (2)
#define MSG_MIN_LEN_CC_LED_WRITE_ALL       (3)
#define MSG_MIN_LEN_CC_LED_READ_ALL        (0)
#define MSG_MIN_LEN_CC_ACCEL_READ          (0)
#define MSG_MIN_LEN_CC_TEMP_READ           (0)
#define MSG_MIN_LEN_CC_BATT_READ           (0)
#define MSG_MIN_LEN_CC_POWER_ARDUINO       (1)
#define MSG_MIN_LEN_CC_GET_AR_POWER        (0)
#define MSG_MIN_LEN_CC_ACCEL_GET_RANGE     (0)
#define MSG_MIN_LEN_CC_ACCEL_SET_RANGE     (1)
#define MSG_MIN_LEN_CC_ACCEL_WRITE_REG     (2)
#define MSG_MIN_LEN_CC_ACCEL_READ_REG      (2)
#define MSG_MIN_LEN_CC_WAKE_ON_ACCEL       (1)
#define MSG_MIN_LEN_AR_SLEEP               (4)
#define MSG_MIN_LEN_AR_WAKE_ON_CONNECT     (1)
#define MSG_MIN_LEN_GATT_SET_CUSTOM        (1)  // one size byte
#define MSG_MIN_LEN_HID_SEND_REPORT        (sizeof(HID_REPORT_T))
#define MSG_MIN_LEN_ANCS_GET_NOTI          (5)
#define MSG_MIN_LEN_MIDI_WRITE             (3)
#define MSG_MIN_LEN_OBSERVER_START         (0)
#define MSG_MIN_LEN_OBSERVER_STOP          (0)
#define MSG_MIN_LEN_DB_LOOPBACK            (0)
#define MSG_MIN_LEN_DB_COUNTER             (0)
#define MSG_MIN_LEN_DB_E2E_LOOPBACK        (0)
#define MSG_MIN_LEN_DB_PTM                 (0)
#define MSG_MIN_LEN_ER_SERIAL              (2)

// Message IDs: Major only
typedef enum {
  MSG_ID_MAJOR_SERIAL     = 0x00,
  MSG_ID_MAJOR_BLE        = 0x05,
  MSG_ID_MAJOR_BOOTLOADER = 0x10,
  MSG_ID_MAJOR_CC         = 0x20,
  MSG_ID_MAJOR_ARDUINO    = 0x30,
  MSG_ID_MAJOR_HID        = 0x35,
  MSG_ID_MAJOR_ERROR      = 0x40,
  MSG_ID_MAJOR_GATT       = 0x45,
  MSG_ID_MAJOR_ANCS       = 0x50,
  MSG_ID_MAJOR_MIDI       = 0x55,
  MSG_ID_MAJOR_OBSERVER   = 0x60,
  MSG_ID_MAJOR_DEBUG      = 0xFE
} MSG_ID_MAJOR_T;

// Message IDs
typedef enum {
  MSG_ID_SERIAL_DATA          = 0x0000,
  MSG_ID_BT_SET_ADV           = 0x0500,
  MSG_ID_BT_SET_CONN          = 0x0502,
  MSG_ID_BT_SET_LOCAL_NAME    = 0x0504,
  MSG_ID_BT_SET_PIN           = 0x0506,
  MSG_ID_BT_ENABLE_PAIRING_PIN= 0x0507,
  MSG_ID_BT_SET_TX_PWR        = 0x0508,
  MSG_ID_BT_GET_CONFIG        = 0x0510,
  MSG_ID_BT_SET_CONFIG        = 0x0511,
  MSG_ID_BT_ADV_ONOFF         = 0x0512,
  MSG_ID_BT_SET_SCRATCH       = 0x0514,
  MSG_ID_BT_GET_SCRATCH       = 0x0515,
  MSG_ID_BT_RESTART           = 0x0520,
  MSG_ID_BT_DISCONNECT        = 0x0521,
  MSG_ID_BT_GET_STATES        = 0x0530,
  MSG_ID_BT_SET_CONFIG_NOSAVE = 0x0540,
  MSG_ID_BT_END_GATE          = 0x0550,
  MSG_ID_BL_CMD_START         = 0x1000,
  MSG_ID_BL_FW_BLOCK          = 0x1001,
  MSG_ID_BL_STATUS            = 0x1002,
  MSG_ID_BL_GET_META          = 0x1003,
  MSG_ID_CC_LED_WRITE         = 0x2000,
  MSG_ID_CC_LED_WRITE_ALL     = 0x2001,
  MSG_ID_CC_LED_READ_ALL      = 0x2002,
  MSG_ID_CC_ACCEL_READ        = 0x2010,
  MSG_ID_CC_TEMP_READ         = 0x2011,
  MSG_ID_CC_BATT_READ         = 0x2015,
  MSG_ID_CC_POWER_ARDUINO     = 0x2020,
  MSG_ID_CC_GET_AR_POWER      = 0x2021,
  MSG_ID_CC_ACCEL_GET_RANGE   = 0x2030,
  MSG_ID_CC_ACCEL_SET_RANGE   = 0x2035,
  MSG_ID_CC_ACCEL_WRITE_REG   = 0x2040,
  MSG_ID_CC_ACCEL_READ_REG    = 0x2041,
  MSG_ID_CC_WAKE_ON_ACCEL     = 0x2050,
  MSG_ID_GATT_SET_GATT        = 0x4501,
  MSG_ID_GATT_GET_GATT        = 0x4502,
  MSG_ID_GATT_SET_CUSTOM      = 0x4503,
  MSG_ID_ANCS_READ            = 0x5001,
  MSG_ID_ANCS_GET_NOTI        = 0x5002,
  MSG_ID_MIDI_READ            = 0x5501,
  MSG_ID_MIDI_WRITE           = 0x5502,
  MSG_ID_OBSERVER_START       = 0x6001,
  MSG_ID_OBSERVER_STOP        = 0x6002,
  MSG_ID_OBSERVER_READ        = 0x6003,
  MSG_ID_AR_SLEEP             = 0x3000,
  MSG_ID_AR_WAKE_ON_CONNECT   = 0x3010,
  MSG_ID_HID_SEND_REPORT      = 0x3500,
  MSG_ID_ERROR_CC             = 0x4000,
  MSG_ID_DB_LOOPBACK          = 0xFE00,
  MSG_ID_DB_COUNTER           = 0xFE01,
  MSG_ID_DB_E2E_LOOPBACK      = 0xFE02,
  MSG_ID_DB_PTM               = 0xFE03,
} MSG_ID_T;

// GATT Services
// Switchable GATT definitions
typedef enum {
  ADV_SWITCH_STANDARD = 0,
  ADV_SWITCH_HID      = 1,
  ADV_SWITCH_MIDI     = 2,
  ADV_SWITCH_ANCS     = 3,
  ADV_SWITCH_OBSERVER = 4,
  ADV_SWITCH_IBEACON  = 5,
  ADV_SWITCH_CUSTOM   = 6,
  ADV_SWITCH_SIZE
} ADV_SWITCH_T;

/**
 * @brief TODO: Documentation needed
 */
typedef struct {
  PTD_UINT8 standard;  ///< TODO: Describe member
  PTD_UINT8 hid;       ///< TODO: Describe member
  PTD_UINT8 midi;      ///< TODO: Describe member
  PTD_UINT8 ancs;      ///< TODO: Describe member
  PTD_UINT8 observer;  ///< TODO: Describe member
  PTD_UINT8 ibeacon;   ///< TODO: Describe member
  PTD_UINT8 custom;    ///< TODO: Describe member
} ADV_SWITCH_ENABLED_T;

extern ADV_SWITCH_ENABLED_T GATTServiceEnabled;

// Observer
#define B_ADDR_LEN 6

/**
 * @brief Structure that encapsulates an Observer Info Message
 */
typedef struct {
  PTD_UINT8 eventType;         ///< Advertisement Type: @ref GAP_ADVERTISEMENT_REPORT_TYPE_DEFINES
  PTD_UINT8 addrType;          ///< address type: @ref GAP_ADDR_TYPE_DEFINES
  PTD_UINT8 addr[B_ADDR_LEN];  ///< Address of the advertisement or SCAN_RSP
  PTD_INT8 rssi;               ///< Advertisement or SCAN_RSP RSSI
  PTD_UINT8 dataLen;           ///< Length (in bytes) of the data field (evtData)
  PTD_UINT8 advData[31];       ///< Data field of advertisement or SCAN_RSP (max of 3 bytes)
} OBSERVER_INFO_MESSAGE_T;

// ANCS

typedef struct {
  PTD_UINT8 cmdID;
  PTD_UINT32 notifUID;
  PTD_UINT8 attr;         // assumes at most one attribute
  PTD_UINT16 attrLength;  // if 0, ignored
} ANCS_GET_NTF_T;

/**
 * @brief TODO: Documentation needed
 */
typedef struct {
  PTD_UINT8 eventID;   ///< TODO: Describe member
  PTD_UINT8 flags;     ///< TODO: Describe member
  PTD_UINT8 catID;     ///< TODO: Describe member
  PTD_UINT8 catCount;  ///< TODO: Describe member
  PTD_UINT32 notiUID;  ///< TODO: Describe member
} ANCS_SOURCE_MSG_T;

typedef enum {
  EVT_FLAG_SILENT          = (1 << 0),
  EVT_FLAG_IMPORTANT       = (1 << 1),
  EVT_FLAG_PRE_EXISTING    = (1 << 2),
  EVT_FLAG_POSITIVE_ACTION = (1 << 3),
  EVT_FLAG_NEGATIVE_ACTION = (1 << 4)
} EVT_FLAG_T;

typedef enum { EVT_ID_ADDED = 0, EVT_ID_MOD = 1, EVT_ID_REMOVED = 2 } EVENT_ID_T;

typedef enum { CMD_ID_ATTR_NOTI = 0, CMD_ID_ATTR_GET = 1 } CMD_ID_T;

/**
 * @brief TODO: Documentation needed
 */
typedef enum {
  NOTI_ATTR_ID_APPID    = 0,
  NOTI_ATTR_ID_TITLE    = 1,
  NOTI_ATTR_ID_SUBTITLE = 2,
  NOTI_ATTR_ID_MESSAGE  = 3,
  NOTI_ATTR_ID_MSG_SIZE = 4,
  NOTI_ATTR_ID_DATE     = 5,
} NOTI_ATTR_ID_T;

typedef enum {
  CAT_ID_OTHER         = 0,
  CAT_ID_INCOMING_CALL = 1,
  CAT_ID_MISSED_CALL   = 2,
  CAT_ID_VOICEMAIL     = 3,
  CAT_ID_SOCIAL        = 4,
  CAT_ID_SCHEDULE      = 5,
  CAT_ID_EMAIL         = 6,
  CAT_ID_NEWS          = 7,
  CAT_ID_HEALTH        = 8,
  CAT_ID_BUSINESS      = 9,
  CAT_ID_LOCATION      = 10,
  CAT_ID_ENTERTAINMENT = 11
} CAT_ID_T;

typedef enum { PTM_MSG_ID_GET_PINSTATE = 0x01, PTM_MSG_ID_SET_PINSTATE = 0x03 } PTM_MSG_ID_T;

// Message Body Structs
// This was backwards in older releases prior to 201406130002
typedef enum { TXPOWER_NEG23DB = 0x00, TXPOWER_NEG6DB, TXPOWER_0DB, TXPOWER_4DB } BT_TXPOWER_DB_T;

typedef enum { ERROR_ID_CC_SERIAL_HEADER = 0x0001 } ERROR_CODES_T;

#define ERROR_MSG_PAYLOAD_SIZE_MAX 10
#define ERROR_

typedef struct {
  PTD_UINT16 errorCode;
  PTD_UINT8 payloadSize;
  PTD_UINT8 payload[ERROR_MSG_PAYLOAD_SIZE_MAX];
} ERROR_MSG_T;

#define MAX_LOCAL_NAME_SIZE 20

#define ADV_MODE_BEAN_AUTH_SET 0x80

typedef enum {
  ADV_STANDARD      = 0x00,
  ADV_IBEACON       = 0x01,
  ADV_STANDARD_AUTH = 0x80,
  ADV_HID_KEYB      = 0x82,  // HID always requires bonding
  ADV_IBEACON_AUTH  = 0x81
} ADV_MODE_T;

#ifdef __objectivec
typedef struct __attribute__((packed))
#else
typedef struct
#endif
{
  PTD_UINT32 pinCode;
  PTD_UINT8 pincodeActive;
} BT_SET_PIN_T;

#define NEW_RADIO_CONFIG
#ifdef __objectivec
typedef struct __attribute__((packed))
#else
typedef struct
#endif
{
  PTD_UINT16 adv_int;
  PTD_UINT16 conn_int;
  PTD_UINT8 power;
  PTD_UINT8 adv_mode;
  PTD_UINT16 ibeacon_uuid;
  PTD_UINT16 ibeacon_major;
  PTD_UINT16 ibeacon_minor;
  PTD_UINT8 local_name[MAX_LOCAL_NAME_SIZE];
  PTD_UINT8 local_name_size;
} BT_RADIOCONFIG_T;

#ifdef __objectivec
typedef struct __attribute__((packed))
#else
typedef struct
#endif
{
  PTD_UINT8 conn_state;
  PTD_UINT8 adv_state;
} BT_STATES_T;

typedef struct {
  PTD_UINT8 number;
  PTD_UINT8 scratch[20];
} BT_SCRATCH_T;

// Accelerometer
typedef enum {
  ACC_AXIS_X = 0x00,
  ACC_AXIS_Y,
  ACC_AXIS_Z,
} ACC_AXIS_T;

/**
 * @brief Structure that encapsulates an accelerometer reading
 */
#ifdef __objectivec
typedef struct __attribute__((packed))
#else
typedef struct
#endif
{
  PTD_INT16 xAxis;        ///< TODO: Describe xAxis
  PTD_INT16 yAxis;        ///< TODO: Describe yAxis
  PTD_INT16 zAxis;        ///< TODO: Describe zAxis
  PTD_UINT8 sensitivity;  ///< Valid value(s) include: 2, 4, 8, or 16 g/512LSB
} ACC_READING_T;

#ifdef __objectivec
typedef struct __attribute__((packed))
#else
typedef struct
#endif
{
  PTD_UINT8 axis;
  PTD_INT16 reading;
  PTD_UINT8 sensitivity;  // actual value: 2,4,8, or 16 g/512LSB
} ACC_AXES_READING_T;

#ifdef __objectivec
typedef struct __attribute__((packed))
#else
typedef struct
#endif
{
  PTD_UINT8 range;  // actual value: 2,4,8, or 16 g/512LSB
} ACC_RANGE_SET_T;

/**
 * @brief Structure that encapsulates a LED RGB value
 */
typedef struct {
  PTD_UINT8 red;    ///< Integer between 0-255
  PTD_UINT8 green;  ///< Integer between 0-255
  PTD_UINT8 blue;   ///< Integer between 0-255
} LED_SETTING_T;

typedef enum { LED_RED = 0x00, LED_GREEN, LED_BLUE } LED_COLOR_T;

typedef struct {
  PTD_UINT8 color;
  PTD_UINT8 intensity;
} LED_IND_SETTING_T;

#ifdef __objectivec
typedef struct __attribute__((packed))
#else
typedef struct
#endif
{
  PTD_UINT32 adv_timer;
  PTD_UINT8 adv_onOff;
} BT_ADV_ONOFF_T;

// Bootloader states (substates)
typedef enum {
  BL_STATE_INIT = 0x00,
  BL_STATE_WRITE_ADDRESS,
  BL_STATE_WRITE_ADDRESS_ACK,
  BL_STATE_WRITE_CHUNK,
  BL_STATE_WRITE_CHUNK_ACK,
  BL_STATE_READ_ADDRESS,
  BL_STATE_READ_ADDRESS_ACK,
  BL_STATE_READ_CHUNK,
  BL_STATE_READ_CHUNK_ACK,
  BL_STATE_VERIFY,
  BL_STATE_DONE,
  BL_STATE_DONE_ACK,

  BL_STATE_START,
  BL_STATE_START_ACK,
  BL_STATE_HELLO,
  BL_STATE_HELLO_ACK,
  BL_STATE_START_RSTAGAIN,

  BL_STATE_DONE_RESET,
  BL_STATE_PROG_MODE,
  BL_STATE_PROG_MODE_ACK,
  BL_STATE_DEVICE_SIG,
  BL_STATE_DEVICE_SIG_ACK,
  BL_STATE_WRITE_CHUNK_TWO,
  BL_STATE_ERROR
} BL_STATE_T;

// Bootloader high-level states
typedef enum {
  BL_HL_STATE_NULL = 0x00,
  BL_HL_STATE_INIT,
  BL_HL_STATE_READY,
  BL_HL_STATE_PROGRAMMING,
  BL_HL_STATE_VERIFY,
  BL_HL_STATE_COMPLETE,
  BL_HL_STATE_ERROR
} BL_HL_STATE_T;

typedef enum { BL_CMD_START_PRG = 0x00, BL_CMD_VERIFY = 0x01, BL_CMD_RESET = 0x02 } BL_CMD_T;

// Bootloader Message Definitions
#define BL_HEX_FIELD_SIZE (4)
#define BL_CRC_FIELD_SIZE (4)
#define MAX_SKETCH_NAME_SIZE (20)

#ifdef __objectivec
typedef struct __attribute__((packed))
#else
typedef struct
#endif
{
  PTD_UINT32 hexSize;
  PTD_UINT32 hexCrc;
  PTD_UINT32 timestamp;
  PTD_UINT8 hexNameSize;
  PTD_UINT8 hexName[MAX_SKETCH_NAME_SIZE];
} BL_SKETCH_META_DATA_T;

#ifdef __objectivec
typedef struct __attribute__((packed))
#else
typedef struct
#endif
{
  BL_SKETCH_META_DATA_T metaData;
} BL_MSG_CMD_START_T;

#ifdef __objectivec
typedef struct __attribute__((packed))
#else
typedef struct
#endif
{
  PTD_UINT16 fwAddress;
  PTD_UINT8 *fwBlock;
} BL_MSG_FW_BLOCK_T;

#ifdef __objectivec
typedef struct __attribute__((packed))
#else
typedef struct
#endif
{
  PTD_UINT8 hlState;   // BL_HL_STATE_T
  PTD_UINT8 intState;  // BL_STATE_T
  PTD_UINT16 blocksSent;
  PTD_UINT16 bytesSent;
} BL_MSG_STATUS_T;

#define HID_DATA_LEN (8)

#ifdef __objectivec
typedef struct __attribute__((packed))
#else
typedef struct
#endif
{
  PTD_UINT8 id;
  PTD_UINT8 type;
  PTD_UINT8 len;
  PTD_UINT8 data[HID_DATA_LEN];
} HID_REPORT_T;

#endif