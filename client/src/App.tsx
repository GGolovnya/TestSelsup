import React, { useRef, useState } from 'react';
//Решил сделать более расширенную версию, чтобы можно было посмотреть на странице правильно ли я понял вашу задачу. По сути у вас в БД есть данные, и с помощью этой формы я должен вносить изменнеия в эти данные, но так же при добавлении значений в БД (новые параметры товара) форма автоматически должна отображать эти поля. Так компонент становится переиспользуемым для любого вида товара и не нужно его переписывать при добавлении новых свойств товара. Как раз для админки клиенту самое то...

//Как и просили, все в одном файле.
//Стили, интрефейсы, сам компонент. Дальше  тестовые данные, которые можно заменить на API, ну и использвание (визуальный вывод на страницу).

//============= СОЗДАНИЕ КОМПОНЕНТА =============//

// Стили. Хоть как то отдельно прописал, чтобы не в инлайне.

const commonStyles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    color: 'rgba(51, 51, 51, 1)',
    marginBottom: '20px',
  },
  formElement: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 0',
    marginBottom: '15px',
  },
  label: {
    minWidth: '150px',
    fontWeight: '600',
    color: 'rgba(102, 102, 102, 1)',
    fontSize: '14px',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid rgba(221, 221, 221, 1)',
    borderRadius: '4px',
    fontSize: '14px',
    color: 'rgba(51, 51, 51, 1)',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    fontFamily: 'inherit',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: 'rgba(25, 172, 226, 1)',
    color: 'rgba(255, 255, 255, 1)',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontSize: '14px',
    fontWeight: '600',
  },
  colorChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    backgroundColor: 'rgba(245, 245, 245, 1)',
    borderRadius: '4px',
  },
  colorSwatch: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '1px solid rgba(221, 221, 221, 1)',
  },
  spanValue: {
    fontSize: '14px',
    color: 'rgba(51, 51, 51, 1)',
    fontFamily: 'inherit'
  },
  colorContainer: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginTop: '30px'
  },
  productCard: {
    padding: '15px',
    border: '1px solid rgba(221, 221, 221, 1)',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  }
};

// Интерфейсы данных

// Увидел что Model принимает Color [], добавил интерфейс и для этих данных оринтируясь на пример с ТЗ

interface Color {
  id: number;
  name: string;
  code: string;
}

interface Param {
  id: number;
  name: string;
  type: 'string' | 'number' | 'select';  //Добавил типы по ТЗ на будущее
  options?: string[];
}

interface ParamValue {
  paramId: number;
  value: string;
}

interface Model {
  id: number;
  paramValues: ParamValue[];
  colors: Color[];
}

interface Props {
  params: Param[];
  model: Model;
}

interface State {
  paramValues: ParamValue[];
}

// Компонент ParamEditor - форма редактирования и получения значений модели

class ParamEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      paramValues: [...props.model.paramValues],
    };
  }

  // Понадобилось размонтирование для выпадающего списка при выборе товара, чтобы новые данные подтягивались, когда другой товар выбираем в форме
  componentDidUpdate(prevProps: Props) {
    if (prevProps.model.id !== this.props.model.id) {
      this.setState({
        paramValues: this.props.model.paramValues
      });
    }
  }

  handleParamValueChange = (paramId: number, value: string) => {
    const newValues = [...this.state.paramValues];
    const existingValueIndex = newValues.findIndex(pv => pv.paramId === paramId);

    if (existingValueIndex !== -1) {
      newValues[existingValueIndex] = { ...newValues[existingValueIndex], value };
    } else {
      newValues.push({ paramId, value });
    }

    this.setState({ paramValues: newValues });
  };

  public getModel(): Model {
    return {
      ...this.props.model,
      paramValues: this.state.paramValues,
    };
  }

  // Согласно ТЗ и переиспользуемости, пришлось создать дополнительный метод отрисовки формы по входящим параметрам, чтобы не добавлять поля вручную.

  renderInput(param: Param, value: string) {
    const inputStyle = { ...commonStyles.input };

    switch(param.type) {
      case 'number':
        return (
          <input
            id={`param-input-${param.id}`}
            type="number"
            value={value}
            onChange={(e) => this.handleParamValueChange(param.id, e.target.value)}
            style={inputStyle}
            placeholder={`Введите ${param.name.toLowerCase()}`}
          />
        );
      case 'select':
        return (
          <select
            id={`param-select-${param.id}`}
            value={value}
            onChange={(e) => this.handleParamValueChange(param.id, e.target.value)}
            style={inputStyle}
          >
            <option value="" id={`param-option-default-${param.id}`}>Выберите {param.name.toLowerCase()}</option>
            {param.options?.map(opt => (
              <option key={opt} value={opt} id={`param-option-${param.id}-${opt}`}>{opt}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            id={`param-input-${param.id}`}
            type="text"
            value={value}
            onChange={(e) => this.handleParamValueChange(param.id, e.target.value)}
            style={inputStyle}
            placeholder={`Введите ${param.name.toLowerCase()}`}
          />
        );
    }
  }

  render() {
    return (
      <div id="param-editor-container">
        <form onSubmit={(e) => e.preventDefault()} id="param-editor-form">
          {this.props.params.map(param => {
            const value = this.state.paramValues.find(pv => pv.paramId === param.id)?.value || '';
            return (
              <div key={param.id} style={commonStyles.formElement} id={`param-group-${param.id}`}>
                <label style={commonStyles.label} htmlFor={`param-${param.id}`} id={`param-label-${param.id}`}>
                  {param.name}:
                </label>
                {this.renderInput(param, value)}
              </div>
            );
          })}
        </form>
      </div>
    );
  }
}

//============= МОДЕЛИРОВАНИЕ API (эмитация реальных данных) =============//

// Как я понял ниже, это то, что будет прилетать в компонент и эти значения могут постоянно меняться и модернизироваться. Возможно я не все учел, но уверен можно исправить.

const params: Param[] = [
  { id: 1, name: 'Назначение', type: 'select', options: ['Повседневное', 'Праздничное', 'Деловое', 'Домашнее'] },
  { id: 2, name: 'Длина', type: 'select', options: ['Мини', 'Медиум', 'Макси'] },
  { id: 3, name: 'Вес', type: 'number' },
  { id: 4, name: 'Описание', type: 'string' },
];

const products: Model[] = [
  {
    id: 1,
    paramValues: [
      { paramId: 1, value: 'Повседневное' },
      { paramId: 2, value: 'Макси' },
      { paramId: 3, value: '250' },
      { paramId: 4, value: 'Стильное платье для самых лучших' },
      //можно добавлять новое...
    ],
    colors: [
      { id: 1, name: 'Красное', code: 'rgba(255, 0, 0, 1)' },
      { id: 2, name: 'Зеленое', code: 'rgba(0, 255, 0, 1)' },
      //можно добавлять новое...
    ],
  },
  {
    id: 2,
    paramValues: [
      { paramId: 1, value: 'Праздничное' },
      { paramId: 2, value: 'Мини' },
      { paramId: 3, value: '180' },
      { paramId: 4, value: 'Коктейльное платье' },
      //можно добавлять новое...
    ],
    colors: [
      { id: 1, name: 'Синее', code: 'rgba(0, 0, 255, 1)' },
      { id: 2, name: 'Розовое', code: 'rgb(255, 0, 179)' },
      //можно добавлять новое...
    ],
  },
  {
    id: 3,
    paramValues: [
      { paramId: 1, value: 'Деловое' },
      { paramId: 2, value: 'Медиум' },
      { paramId: 3, value: '300' },
      { paramId: 4, value: 'Строгое офисное платье' },
      //можно добавлять новое...
    ],
    colors: [
      { id: 1, name: 'Черное', code: 'rgba(0, 0, 0, 1)' },
      { id: 2, name: 'Серое', code: 'rgba(128, 128, 128, 1)' },
      //можно добавлять новое...
    ],
  },
];

//============= ИСПОЛЬЗОВАНИЕ ParamEditor НА СТРАНИЦЕ =============//

// Демонстрация переиспользуемости компонента.

// Что бы проще было осуществить проверку, решил смоделировать карточку товара, которая будет брать данные (как в реальном маркет плейсе) и выводить на экран информацию о товаре. И как я понял форма (которая будет в админе у клиента) будет делат нужные изменения в БД (ну или где там должно все храниться...), соответственно карточка товара будет тоже перерендериваться и подгружать новые значения (если я правильно понял механику).

function App() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [currentProducts, setCurrentProducts] = useState<Model[]>(products);
  const editorRef = useRef<ParamEditor>(null);

  const handleProductSelect = (productId: number) => {
    setSelectedProductId(productId);
  };

  const saveModelChanges = () => {
    if (editorRef.current && selectedProductId) {
      const updatedModel = editorRef.current.getModel();
      setCurrentProducts(prev => 
        prev.map(product => 
          product.id === selectedProductId ? { ...updatedModel, id: product.id } : product
        )
      );
    }
  };

  const selectedProduct = currentProducts.find(p => p.id === selectedProductId);

  return (
    <div style={commonStyles.container} id="app-container">
      <h2 style={commonStyles.title} id="editor-title">Редактор параметров товара</h2>
      
      <div style={commonStyles.formElement}>
        <label style={commonStyles.label}>Выберите товар:</label>
        <select 
          style={commonStyles.input}
          value={selectedProductId || ''}
          onChange={(e) => handleProductSelect(Number(e.target.value))}
        >
          <option value="">Выберите товар</option>
          {currentProducts.map(product => (
            <option key={product.id} value={product.id}>
              Товар #{product.id}
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <>
          <ParamEditor
            ref={editorRef}
            params={params}
            model={selectedProduct}
          />
          <button
            onClick={saveModelChanges}
            style={commonStyles.button}
            id="save-button"
          >
            Сохранить изменения
          </button>
        </>
      )}
      <div style={commonStyles.productGrid}>
        {currentProducts.map(product => (
          <div key={product.id} style={commonStyles.productCard}>
            <h3 style={commonStyles.title}>Товар #{product.id}</h3>
            {product.paramValues.map(param => {
              const paramDef = params.find(p => p.id === param.paramId);
              return (
                <div key={param.paramId} style={commonStyles.formElement}>
                  <span style={commonStyles.label}>{paramDef?.name}:</span>
                  <span style={commonStyles.spanValue}>
                    {param.value}{param.paramId === 3 ? ' г' : ''}
                  </span>
                </div>
              );
            })}
            <div style={commonStyles.formElement} id={`product-colors-${product.id}`}>
              <span style={commonStyles.label} id={`colors-label-${product.id}`}>Доступные цвета:</span>
              <div style={commonStyles.colorContainer} id={`colors-container-${product.id}`}>
                {product.colors.map(color => (
                  <div 
                    key={color.id} 
                    style={commonStyles.colorChip}
                    id={`color-chip-${product.id}-${color.id}`}
                  >
                    <div 
                      style={{ ...commonStyles.colorSwatch, backgroundColor: color.code }}
                      id={`color-swatch-${product.id}-${color.id}`} 
                    />
                    <span 
                      style={commonStyles.spanValue}
                      id={`color-name-${product.id}-${color.id}`}
                    >
                      {color.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

// Мысли (TO DO): 1) добавить валидацию 2) Добавить отлавливание ошибок 3) перейти на функциональные компоненты с использованием его хуков 4) Все разделить на отдельные файлы (стили и прочее) 5) Разделить комопонент ParamEditor на более мелкие детали для переиспользуемости и т.д.

// Вообщем как то так, понимаю множно это все дорабатывать, менять подходы и прочее прочее...но в целом вроде мышление продемонстрировал. При налии линтера и стайлгайдов разумеется буду свой код корректировать под общее направление разработки команды.