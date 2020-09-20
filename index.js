// Open a form by ID and log the responses to each question.
const form = FormApp.getActiveForm()

// const items = {}

function getItems() {
	// 送信したフォームの回答のすべての項目を取得する
	// const itemResponses = e.response.getItemResponses()

	const formResponses = form.getResponses()
	const formResponse = formResponses[formResponses.length - 1]
	const itemResponses = formResponse.getItemResponses()

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

	// グローバルオブジェクトのitemに格納しておく
	// items[todo] = todo
	// items[date] = date
	// items[time] = time

	// トリガーをセットする
	setTrigger(date, time)

	return { todo, date, time }
}

// 指定された時刻にトリガーをセットする
// day : '2020-01-05'
// time : '09:05'
function setTrigger(date, time) {
	const year = parseInt(date.split('-')[0]) //2020
	const month = parseInt(date.split('-')[1]) - 1 //01
	const day = parseInt(date.split('-')[2]) //05

	const triggerTime = new Date(year, month, day)

	const hours = parseInt(time.split(':')[0]) //'09'
	const minutes = parseInt(time.split(':')[1]) //'05'
	console.log('settrigger', year, month, day, hours, minutes)

	triggerTime.setHours(hours)
	triggerTime.setMinutes(minutes)

	ScriptApp.newTrigger('lineNotify').timeBased().at(triggerTime).create()

	// const trigger_id = trigger.getUniqueId()
}

// function delTrigger() {
// 	const triggers = ScriptApp.getProjectTriggers()
// 	for (const trigger of triggers) {
// 		if (trigger.getHandlerFunction() == 'myFunction') {
// 			ScriptApp.deleteTrigger(trigger)
// 		}
// 	}
// 	triggers.forEach((trigger) => {
// 		if (trigger.getHandlerFunction() === 'lineNotify') {
// 			ScriptApp.deleteTrigger(trigger)
// 		}
// 	})
// }

const lineNotify = () => {
	const LINE_NOTIFY_API_TOKEN = 'RSOVVFlv2Cdh8ygd59rMyz9GfujNyvZIXIA73PlpEPQ'
	const LINE_NOTIFY_API_URL = 'https://notify-api.line.me/api/notify'

	//! グローバルからはうまくとってこれなかった
	// グローバルオブジェクトitemsから渡してる
	// const { todo } = items

	const { todo } = getItems()

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Bearer ${LINE_NOTIFY_API_TOKEN}`,
		},
		payload: `message=\n${todo}`,
		// muteHttpExceptions: true,
	}

	console.log('linetodo', todo)

	UrlFetchApp.fetch(LINE_NOTIFY_API_URL, options)

	// delete Trigger とりあえずしていない
}
