import { render, screen, fireEvent } from '@testing-library/react';
import InputTest from '@/components/InputTest';

describe('<InputTest />', () => {
  it('renders input and submit button', () => {
    render(<InputTest />);

    // 입력 필드와 버튼이 있는지 확인.
    const inputElement = screen.getByRole('spinbutton'); // spinbutton은 <input type="number"> 필드에 대한 ARIA(Role) 용어
    const buttonElement = screen.getByRole('button', { name: 'submit' });

    expect(inputElement).toBeInTheDocument();
    expect(buttonElement).toBeInTheDocument();
  });

  it('displays formatted number on submit', () => {
    render(<InputTest />);

    // 사용자가 숫자 입력 후 제출 버튼 클릭  시나리오 시뮬레이션.
    const inputElement = screen.getByRole('spinbutton');
    const buttonElement = screen.getByRole('button', { name: 'submit' });

    // 숫자 입력.
    fireEvent.change(inputElement, { target: { value: '1234' } });
    // 제출 버튼 클릭.
    fireEvent.click(buttonElement);

    // 포맷된 값이 확인.
    const formattedValue = screen.getByText('Value : 1,234');
    expect(formattedValue).toBeInTheDocument();
  });
});
