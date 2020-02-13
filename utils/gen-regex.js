

const _ = require('lodash/fp')

// const removeAccents = _.flow([
//     _.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a"),
//     _.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e"),
//     _.replace(/ì|í|ị|ỉ|ĩ/g, "i"),
//     _.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o"),
//     _.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u"),
//     _.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y"),
//     _.replace(/đ/g, "d"),
//     _.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A"),
//     _.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E"),
//     _.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I"),
//     _.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O"),
//     _.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U"),
//     _.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y"),
//     _.replace(/Đ/g, "D"),
// ])

const cities = [
    'An Giang',
    'Bà Rịa - Vũng Tàu',
    'Bắc Giang',
    'Bắc Kạn',
    'Bạc Liêu',
    'Bắc Ninh',
    'Bến Tre',
    'Bình Định',
    'Bình Dương',
    'Bình Phước',
    'Bình Thuận',
    'Cà Mau',
    'Cao Bằng',
    'Đắk Lắk',
    'Đắk Nông',
    'Điện Biên',
    'Đồng Nai',
    'Đồng Tháp',
    'Gia Lai',
    'Hà Giang',
    'Hà Nam',
    'Hà Tĩnh',
    'Hải Dương',
    'Hậu Giang',
    'Hòa Bình',
    'Hưng Yên',
    'Khánh Hòa',
    'Kiên Giang',
    'Kon Tum',
    'Lai Châu',
    'Lâm Đồng',
    'Lạng Sơn',
    'Lào Cai',
    'Long An',
    'Nam Định',
    'Nghệ An',
    'Ninh Bình',
    'Ninh Thuận',
    'Phú Thọ',
    'Quảng Bình',
    'Quảng Nam',
    'Quảng Ngãi',
    'Quảng Ninh',
    'Quảng Trị',
    'Sóc Trăng',
    'Sơn La',
    'Tây Ninh',
    'Thái Bình',
    'Thái Nguyên',
    'Thanh Hóa',
    'Thừa Thiên Huế',
    'Tiền Giang',
    'Trà Vinh',
    'Tuyên Quang',
    'Vĩnh Long',
    'Vĩnh Phúc',
    'Yên Bái',
    'Phú Yên',
    // 'Cần Thơ',
    // 'Đà Nẵng',
    // 'Hải Phòng',
    // 'Hà Nội',
    // 'Hồ Chí Minh',
]

const createRegex = str => {
    const data = str.split(' ')
    const val0 = data.length > 2 ? [str] : []
    const val1 = data.reduce((acc, val, index, arr) => {
        const value = arr.map((v, i) => {
            if (i === index && index < arr.length - 1) {
                return v + ' '
            }
            return v
        }).join('')
        
        return acc.concat(value)
    }, [])

    const val2 = val1.map(removeAccents)
    // const val3 = data.map(_.head).join('')

    const val4 = 'Tỉnh ' + str
    const val5 = str + ' Province'
    const val6 = removeAccents(str) + ' Province'
    // const val7 = val3 + 'C'

    return '(' + val0.concat(val1, val2, val4, val5, val6).join('|') + ')'
}


const r = cities.reduce((acc, cur) => {
    acc[cur] = createRegex(cur)

    return acc
}, {})


console.log(JSON.stringify(r, null, 2))
