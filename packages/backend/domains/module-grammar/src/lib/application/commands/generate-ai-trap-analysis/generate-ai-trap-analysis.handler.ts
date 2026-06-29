import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateAiTrapAnalysisCommand } from './generate-ai-trap-analysis.command';
import { Inject, NotFoundException } from '@nestjs/common';
import * as grammarTrapRepositoryInterface from '../../../domain/repositories/grammar-trap.repository.interface';

@CommandHandler(GenerateAiTrapAnalysisCommand)
export class GenerateAiTrapAnalysisHandler
  implements ICommandHandler<GenerateAiTrapAnalysisCommand, any>
{
  constructor(
    @Inject(grammarTrapRepositoryInterface.GRAMMAR_TRAP_REPOSITORY)
    private readonly trapRepository: grammarTrapRepositoryInterface.IGrammarTrapRepository
  ) {}

  async execute(command: GenerateAiTrapAnalysisCommand): Promise<any> {
    const { trapId } = command;
    const trap = await this.trapRepository.findById(trapId);

    if (!trap) {
      throw new NotFoundException(
        `Không tìm thấy bẫy ngữ pháp với ID: ${trapId}`
      );
    }

    if (trap.aiAnalysis) {
      return {
        id: trapId,
        success: true,
        aiAnalysis: trap.aiAnalysis,
      };
    }

    const qText = trap.questionText.toLowerCase();
    const uAns = trap.userAnswer;
    const cAns = trap.correctAnswer;
    let analysisContent = '';

    if (
      qText.includes('since') ||
      qText.includes('for') ||
      trap.explanation.toLowerCase().includes('since') ||
      trap.explanation.toLowerCase().includes('for')
    ) {
      analysisContent = `### 🕸️ Phân Tích Bẫy Ngữ Pháp: **Since vs For**
Bạn đã chọn nhầm **"${uAns}"** thay vì đáp án đúng là **"${cAns}"**.
- **Điểm gây nhiễu**: Cả *Since* và *For* đều dùng trong thì hoàn thành để chỉ thời gian, khiến bạn dễ nhầm lẫn khi chỉ dịch nghĩa tiếng Việt là "từ khi" hoặc "cho".
- **Tại sao bạn sai?**: Bạn đã không phân biệt được *mốc thời gian* và *khoảng thời gian*. Bạn đã áp dụng *Since* cho một khoảng thời gian, hoặc *For* cho một điểm thời gian cụ thể.

### 🌟 Quy Tắc Vàng
- **SINCE + Mốc thời gian (Point in Time)**: Điểm bắt đầu của hành động (ví dụ: *since 2020*, *since Monday*, *since I was young*).
- **FOR + Khoảng thời gian (Period of Time)**: Độ dài thời gian hành động diễn ra (ví dụ: *for 5 years*, *for a long time*, *for two weeks*).

### 🔮 Thần Chú Ghi Nhớ (Mnemonic Formula)
> *“**S**ince là **S**tart (điểm khởi đầu)*
> ***F**or là **F**igure (con số khoảng lâu)”*
*(Cứ thấy chữ số, khoảng thời gian thì dùng FOR. Thấy điểm bắt đầu hay mệnh đề quá khứ thì dùng SINCE nhé!)*`;
    } else if (
      qText.includes('had entered') ||
      qText.includes('no sooner') ||
      qText.includes('hardly') ||
      trap.explanation.toLowerCase().includes('no sooner') ||
      trap.explanation.toLowerCase().includes('inversion')
    ) {
      analysisContent = `### 🕸️ Phân Tích Bẫy Ngữ Pháp: **Đảo Ngữ Với "No Sooner" / "Hardly"**
Bạn đã chọn nhầm **"${uAns}"** thay vì đáp án đúng là **"${cAns}"**.
- **Điểm gây nhiễu**: Sự đảo lộn trật tự chủ ngữ - động từ và sự phối hợp giữa các liên từ phụ thuộc (*than* vs *when*).
- **Tại sao bạn sai?**: Bạn có thể quên đảo trợ động từ *had* lên trước chủ ngữ, hoặc nhầm lẫn giữa liên từ đi kèm của *No sooner* (phải là *than*) và *Hardly/Scarcely* (phải là *when*).

### 🌟 Quy Tắc Vàng
1. **No sooner + had + S + V3/ed + than + S + V2/ed** (Vừa mới... thì...)
2. **Hardly/Scarcely + had + S + V3/ed + when + S + V2/ed**

### 🔮 Thần Chú Ghi Nhớ (Mnemonic Formula)
> *“Vừa mới... thì... đảo ngay **HAD** lên trước,*
> ***No sooner** đi với **THAN**,*
> ***Hardly** kết bạn cùng **WHEN** vẹn toàn!”*`;
    } else if (
      qText.includes('insist') ||
      qText.includes('secretary be') ||
      trap.explanation.toLowerCase().includes('subjunctive') ||
      trap.explanation.toLowerCase().includes('giả định')
    ) {
      analysisContent = `### 🕸️ Phân Tích Bẫy Ngữ Pháp: **Thức Giả Định (Subjunctive Mood)**
Bạn đã chọn nhầm **"${uAns}"** thay vì đáp án đúng là **"${cAns}"**.
- **Điểm gây nhiễu**: Bạn nhìn thấy chủ ngữ ngôi thứ ba số ít (ví dụ: *secretary*, *he*, *she*) và theo thói quen chia động từ thêm "s/es" hoặc dùng "is/was".
- **Tại sao bạn sai?**: Động từ *insist, suggest, recommend, demand*... đi kèm with mệnh đề *that* yêu cầu động từ luôn ở dạng **nguyên thể không to (bare infinitive)**, bất kể chủ ngữ là gì!

### 🌟 Quy Tắc Vàng
- Cấu trúc: **S1 + [insist/suggest/demand/...] + that + S2 + V (nguyên thể không chia)**
- Ví dụ: *He insists that she **be** here* (không dùng *is* hay *was*).

### 🔮 Thần Chú Ghi Nhớ (Mnemonic Formula)
> *“Khuyên, yêu cầu, hay khăng khăng,*
> *Mệnh đề có **THAT**, nhớ hằng trong tâm:*
> *Chủ từ dù ít hay nhiều,*
> *Động từ **NGUYÊN THỂ** là điều tối cao!”*`;
    } else if (
      qText.includes('would have passed') ||
      qText.includes('had studied') ||
      trap.explanation.toLowerCase().includes('conditional') ||
      trap.explanation.toLowerCase().includes('điều kiện')
    ) {
      analysisContent = `### 🕸️ Phân Tích Bẫy Ngữ Pháp: **Câu Điều Kiện Hỗn Hợp / Loại 3**
Bạn đã chọn nhầm **"${uAns}"** thay vì đáp án đúng là **"${cAns}"**.
- **Điểm gây nhiễu**: Sự phối hợp thì giữa mệnh đề giả định và mệnh đề kết quả trong quá khứ hoặc hiện tại.
- **Tại sao bạn sai?**: Dễ nhầm lẫn công thức giữa loại 2 (giả định hiện tại) và loại 3 (giả định quá khứ), hoặc không nhận ra dấu mốc thời gian quá khứ (*last week*, *yesterday*).

### 🌟 Quy Tắc Vàng
- **Điều kiện loại 3 (Trái quá khứ)**:
  * **If + S + had + V3/ed**, **S + would have + V3/ed**
- **Điều kiện loại 2 (Trái hiện tại)**:
  * **If + S + V2/ed (were)**, **S + would + V-inf**

### 🔮 Thần Chú Ghi Nhớ (Mnemonic Formula)
> *“Quá khứ lùi thì thành **HAD V3**,*
> *Kết quả nhận lại **WOULD HAVE V3** liền tay.*
> *Hiện tại giả định chớ sai,*
> *Lùi về **V2/WERE** hoài bão mong!”*`;
    } else if (
      trap.category === 'syntax' &&
      (cAns.endsWith('ly') || uAns.endsWith('ly'))
    ) {
      analysisContent = `### 🕸️ Phân Tích Bẫy Ngữ Pháp: **Tính Từ vs Trạng Từ (Adjective vs Adverb)**
Bạn đã chọn nhầm **"${uAns}"** thay vì đáp án đúng là **"${cAns}"**.
- **Điểm gây nhiễu**: Vị trí đứng trước danh từ hoặc đứng sau động từ thường/động từ liên kết (linking verbs).
- **Tại sao bạn sai?**: Trạng từ thường bổ nghĩa cho động từ thường hoặc tính từ khác, trong khi tính từ chỉ bổ nghĩa cho danh từ hoặc đứng sau động từ liên kết như *be, feel, look, become*. Bạn đã nhầm lẫn vai trò bổ nghĩa trong câu phức.

### 🌟 Quy Tắc Vàng
- **Động từ thường + Trạng từ (-ly)** (Ví dụ: *decide unanimously*, *run quickly*).
- **Động từ liên kết (Linking verb) + Tính từ** (Ví dụ: *feel unanimous*, *is beautiful*).

### 🔮 Thần Chú Ghi Nhớ (Mnemonic Formula)
> *“Hành động thường nhật trôi mau,*
> *Bổ sung trạng từ đuôi **-LY** đi kèm.*
> *Giác quan, liên kết êm đềm,*
> *Giữ nguyên tính từ tô điểm sắc hương!”*`;
    } else {
      const capitalizedCategory =
        trap.category.charAt(0).toUpperCase() + trap.category.slice(1);
      analysisContent = `### 🕸️ Phân Tích Bẫy Ngữ Pháp: **Chuyên Đề ${capitalizedCategory}**
Bạn đã chọn nhầm **"${uAns}"** thay vì đáp án đúng là **"${cAns}"**.
- **Tại sao câu này là một cái bẫy?**: Cấu trúc câu hỏi đòi hỏi bạn phải nắm vững cách phối hợp ngữ pháp của cụm từ và hiểu rõ ngữ cảnh sử dụng. Đáp án gây nhiễu được thiết kế rất giống đáp án đúng nhưng sai sót về mặt cú pháp hoặc sự hòa hợp.
- **Giải thích sâu**: ${trap.explanation}

### 🌟 Quy Tắc Vàng
- Hãy chú ý đến động từ chính, sự hòa hợp giữa chủ ngữ và động từ, và các trạng từ chỉ thời gian trong câu để xác định cấu trúc ngữ pháp chính xác. Luôn luôn dịch nghĩa và kiểm tra cú pháp cấu trúc trước khi lựa chọn.

### 🔮 Thần Chú Ghi Nhớ (Mnemonic Formula)
> *“Nhìn trước ngó sau tìm manh mối,*
> *Cú pháp vững vàng, chớ vội vàng.*
> *Đọc kỹ đề bài, so đáp án,*
> *Bẫy nào cũng phá, vượt gian nan!”*`;
    }

    const updatedTrap = await this.trapRepository.updateTrap(trapId, {
      aiAnalysis: analysisContent,
    });

    return {
      id: trapId,
      success: true,
      aiAnalysis: analysisContent,
      data: updatedTrap,
    };
  }
}
