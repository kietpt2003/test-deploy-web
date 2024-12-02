const slugify = (text) => {
  // Hàm loại bỏ dấu
  const removeDiacritics = (str) => {
    const diacritics = [
      { base: 'a', letters: /[áàảãạâấầẩẫậăẮẰẲẴẶ]/g },
      { base: 'e', letters: /[éèẻẽẹêếềểễệÉÈẺẼẸÊẾỀỂỄỆ]/g },
      { base: 'i', letters: /[íìỉĩịÍÌỈĨỊ]/g },
      { base: 'o', letters: /[óòỏõọôốồổỗộơớờởỡợÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ]/g },
      { base: 'u', letters: /[úùủũụưứừửữựÚÙỦŨỤƯỨỪỬỮỰ]/g },
      { base: 'y', letters: /[ýỳỷỹỵÝỳỲỶỸỴ]/g },
      { base: 'd', letters: /[đĐ]/g },
    ];
    
    for (const { base, letters } of diacritics) {
      str = str.replace(letters, base);
    }
    
    return str;
  };
  

  return removeDiacritics(text) // Bỏ dấu
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng dấu "-"
    .replace(/[^\w\-]+/g, '') // Loại bỏ các ký tự không phải là chữ cái, số và dấu "-"
    .replace(/\-\-+/g, '-') // Thay thế nhiều dấu "-" bằng một dấu "-"
    .replace(/^-+/, '') // Loại bỏ dấu "-" ở đầu chuỗi
    .replace(/-+$/, ''); // Loại bỏ dấu "-" ở cuối chuỗi
};

export default slugify;

