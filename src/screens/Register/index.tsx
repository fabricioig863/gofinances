import React, { useState } from 'react';
import { Modal, 
  TouchableWithoutFeedback, 
  Keyboard,
  Alert 
} from 'react-native';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

import { useForm } from 'react-hook-form';
import { 
  useNavigation,
  NavigationProp,
  ParamListBase
} from '@react-navigation/native';

import { InputForm } from '../../components/Form/InputForm';
import { Button } from '../../components/Form/Button';
import { TransactionTypeButton } from '../../components/Form/TransactionTypeButton';
import { CategorySelectButton } from '../../components/Form/CategorySelectButton';
import { CategorySelect } from '../CategorySelect';

import {
  Container,
  Header,
  Title,
  Form,
  Fields,
  TransactionsType
} from './styles';

export type FormData = {
  [name: string]: any;
  amount: string;
}

const schema = Yup.object({
  name: Yup
          .string()
          .required('Nome é obrigatório')
          .min(2, 'A descrição deve ter no minimo'),
  amount: Yup
          .number()
          .typeError('Informe um valor numérico')
          .positive('O valor não pode ser negativo')
          .required('O valor é obrigatório')
})

export function Register() {
  const [transactionType, setTransactionType] = useState('')
  const [categorySelectModalOpen, setCategorySelectModalOpen] = useState(false);

  const [category, setCategory] = useState({
    key: 'category',
    name: 'Categoria',
  })

  const { navigate }: NavigationProp<ParamListBase> = useNavigation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  function handleTransactionsTypeSelect(type: 'up' | 'down') {
    setTransactionType(type);
  }

  function handleOpenSelectCategoryModal() {
    setCategorySelectModalOpen(true)
  }

  function handleCloseSelectCategoryModal() {
    setCategorySelectModalOpen(false)
  }

  async function handleRegister(form: Partial<FormData>) {
    if(!transactionType)
      return Alert.alert('Selecione o tipo da transação');
    
    if(category.key === 'category')
      return Alert.alert('Selecione a categoria');


      const newTransaction = {
        id: String(uuid.v4()),
        name: form.name,
        amount: form.amount,
        transactionType,
        category: category.key,
        date: new Date()
      }  
    
    try {
      const dataKey = '@gofinances:transactions';
      
      const data = await AsyncStorage.getItem(dataKey);
      const currentData = data ? JSON.parse(data) : [];

      const dataFormatted = [
        ...currentData,
        newTransaction
      ]

      await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted));

      reset();
      setTransactionType('');
      setCategory({
        key: 'category',
        name: 'Categoria',
      });

      navigate("Listagem");

    } catch (error) {
      console.log(error);
      Alert.alert('Não foi possível salvar');
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>Cadastro</Title>
        </Header>

        <Form>
          <Fields>
            <InputForm
              name="name"
              control={control}
              placeholder="Nome"
              autoCapitalize="sentences"
              autoCorrect={false}
              error={errors.name && errors.name.message}
            />

            <InputForm
              name="amount"
              control={control}
              placeholder="Preço"
              keyboardType="numeric"
              error={errors.amount && errors.amount.message}
            />

            <TransactionsType>
              <TransactionTypeButton
                type="up"
                title="Income"
                onPress={() => handleTransactionsTypeSelect('up')}
                isActive={transactionType === 'up'}
              />
              <TransactionTypeButton
                type="down"
                title="Outcome"
                onPress={() => handleTransactionsTypeSelect('down')}
                isActive={transactionType === 'down'}
              />
            </TransactionsType>

            <CategorySelectButton
              title={category.name}
              onPress={handleOpenSelectCategoryModal}
            />
          </Fields>

          <Button
            title="Enviar"
            onPress={handleSubmit(handleRegister)}
          />
        </Form>

        <Modal visible={categorySelectModalOpen} statusBarTranslucent={true}>
          <CategorySelect
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseSelectCategoryModal}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  )
}
