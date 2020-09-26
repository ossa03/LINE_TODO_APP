// Open a form by ID and log the responses to each question.
const form = FormApp.getActiveForm()
// Opens the spreadsheet with the given ID
const ss = SpreadsheetApp.openById('16kV38TzsUBcbGzjpteviksPgGCHygGmQovLxbxhYess')
// Open a sheet with ActiveSheet
const sheet = ss.getActiveSheet()

// TODO,指定日,指定時間,トリガーID,を取得する関数
function getItems() {
	// 送信したフォームの回答のすべての項目を取得する
	// const itemResponses = e.response.getItemResponses()

	const formResponses = form.getResponses() //今までの全回答
	const formResponse = formResponses[formResponses.length - 1] //最後の回答
	const itemResponses = formResponse.getItemResponses() //最後の回答の書く項目

	// デバッグ用
	itemResponses.forEach((item, index) => {
		console.log(index, ':', item.getResponse())
		// 0:'todo'
		// 1:'2020-09-09'
		// 2:'09:05'
	})

	const todo = itemResponses[0].getResponse()
	const date = itemResponses[1].getResponse()
	const time = itemResponses[2].getResponse()

	// トリガーをセットする
	const triggerId = setTrigger(date, time)

	return { todo, date, time, triggerId }
}

// 指定された時刻にトリガーをセットしてトリガーIDを返す関数
// day : '2020-01-05'
// time : '09:05'
function setTrigger(date, time) {
	const year = parseInt(date.split('-')[0]) //2020
	const month = parseInt(date.split('-')[1]) - 1 //01  //monthは0〜10,//9月なら8にしないといけないので−１している
	const day = parseInt(date.split('-')[2]) //05

	const triggerTime = new Date(year, month, day) // 年,月、日、を指定してDateオブジェクトを作成

	const hours = parseInt(time.split(':')[0]) //'09'
	const minutes = parseInt(time.split(':')[1]) //'05'

	// log
	console.log('setTrigger', year, month, day, hours, minutes)

	triggerTime.setHours(hours) // HHをセット
	triggerTime.setMinutes(minutes) // mmをセット

	// トリガー作成
	ScriptApp.newTrigger('lineNotify').timeBased().at(triggerTime).create()

	// トリガーID取得
	const triggerId = trigger.getUniqueId()

	// スプレッドシートにトリガーIDを書き込む
	const lastRow = sheet.getLastRow() //最終行
	const newColumn = sheet.getLastColumn() + 1 //最終行に新しい列を追加(トリガーID用)
	const newCell = sheet.getRange(lastRow, newColumn) //トリガーIDを書き込みたいセルを指定
	// ここにトリガーIDを書き込む
	newCell.setValue(triggerId)

	// log
	console.log('トリガーID:', triggerId)

	return triggerId
}

// トリガーを削除する関数
function deleteTrigger(triggerId) {
	const triggers = ScriptApp.getProjectTriggers() // このプロジェクトのすべてのトリガーを取得
	triggers.forEach((trigger) => {
		// 引数のトリガーIDと一致するものを削除する
		if (trigger.getUniqueId() === triggerId) {
			ScriptApp.deleteTrigger(trigger)
		}
	})
}

// LINEに通知する関数
function lineNotify() {
	// const LINE_NOTIFY_API_TOKEN = 'RSOVVFlv2Cdh8ygd59rMyz9GfujNyvZIXIA73PlpEPQ'
	const LINE_NOTIFY_API_TOKEN = PropertiesService.getScriptProperties('LINE_NOTIFY_API_TOKEN')
	const LINE_NOTIFY_API_URL = 'https://notify-api.line.me/api/notify'

	// TODOを取得する
	const { todo, triggerId } = getItems()

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Bearer ${LINE_NOTIFY_API_TOKEN}`,
		},
		payload: `message=:\n\n${todo}\n\n\nトリガーID:\n${triggerId}`,
	}

	// log
	console.log('linetodo', todo)

	// LINEに通知
	UrlFetchApp.fetch(LINE_NOTIFY_API_URL, options)

	// LINEに通知したのでトリガーを削除する(ID指定)
	// トリガーIDを渡す
	deleteTrigger(triggerId)
	// log
	console.log('トリガー削除:', triggerId)
}
