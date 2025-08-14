import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Plus, Trash2, FileText, Calculator, User, Zap, Camera } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { services, categories } from './data/services.js'
import { problemasEletricos, outrosProblemas } from './data/problems.js'
import './App.css'

function App() {
  // Estados principais
  const [currentTab, setCurrentTab] = useState('cliente')
  const [cliente, setCliente] = useState({ nome: '', contato: '', endereco: '' })
  const [servicosSelecionados, setServicosSelecionados] = useState([])
  const [servicosManuais, setServicosManuais] = useState([])
  const [despesasExtras, setDespesasExtras] = useState([])
  const [observacoesGerais, setObservacoesGerais] = useState('')
  const [novoServicoManual, setNovoServicoManual] = useState({ nome: '', descricao: '', preco: '' })
  const [novaDespesa, setNovaDespesa] = useState({ descricao: '', valor: '' })
  const [problemasEletricosSelecionados, setProblemasEletricosSelecionados] = useState([])
  const [outrosProblemasSelecionados, setOutrosProblemasSelecionados] = useState([])
  const [descricaoRelatorio, setDescricaoRelatorio] = useState('')
  const [fotosRelatorio, setFotosRelatorio] = useState([])

  // Função para adicionar/remover serviços selecionados
  const toggleServico = (servico) => {
    const existe = servicosSelecionados.find(s => s.id === servico.id)
    if (existe) {
      setServicosSelecionados(servicosSelecionados.filter(s => s.id !== servico.id))
    } else {
      setServicosSelecionados([...servicosSelecionados, {
        ...servico,
        preco_unitario: servico.preco_padrao,
        quantidade: 1,
        observacoes: ''
      }])
    }
  }

  // Função para atualizar preço de um serviço selecionado
  const atualizarPrecoServico = (id, novoPreco) => {
    setServicosSelecionados(servicosSelecionados.map(s =>
      s.id === id ? { ...s, preco_unitario: parseFloat(novoPreco) || 0 } : s
    ))
  }

  // Função para atualizar quantidade de um serviço selecionado
  const atualizarQuantidadeServico = (id, novaQuantidade) => {
    setServicosSelecionados(servicosSelecionados.map(s =>
      s.id === id ? { ...s, quantidade: parseFloat(novaQuantidade) || 0 } : s
    ))
  }

  // Função para atualizar observações de um serviço selecionado
  const atualizarObservacoesServico = (id, observacoes) => {
    setServicosSelecionados(servicosSelecionados.map(s => 
      s.id === id ? { ...s, observacoes } : s
    ))
  }

  // Função para adicionar serviço manual
  const adicionarServicoManual = () => {
    if (novoServicoManual.nome && novoServicoManual.preco) {
      setServicosManuais([...servicosManuais, {
        id: Date.now().toString(),
        ...novoServicoManual,
        preco: parseFloat(novoServicoManual.preco) || 0
      }])
      setNovoServicoManual({ nome: '', descricao: '', preco: '' })
    }
  }

  // Função para remover serviço manual
  const removerServicoManual = (id) => {
    setServicosManuais(servicosManuais.filter(s => s.id !== id))
  }

  // Função para adicionar despesa extra
  const adicionarDespesaExtra = () => {
    if (novaDespesa.descricao && novaDespesa.valor) {
      setDespesasExtras([...despesasExtras, {
        id: Date.now().toString(),
        ...novaDespesa,
        valor: parseFloat(novaDespesa.valor) || 0
      }])
      setNovaDespesa({ descricao: '', valor: '' })
    }
  }

  // Função para remover despesa extra
  const removerDespesaExtra = (id) => {
    setDespesasExtras(despesasExtras.filter(d => d.id !== id))
  }

  // Funções para relatório
  const toggleSelecao = (item, lista, setLista) => {
    if (lista.includes(item)) {
      setLista(lista.filter(p => p !== item))
    } else {
      setLista([...lista, item])
    }
  }

  const adicionarFotoRelatorio = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setFotosRelatorio([...fotosRelatorio, { id: Date.now(), src: reader.result, descricao: '' }])
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const atualizarDescricaoFoto = (id, descricao) => {
    setFotosRelatorio(fotosRelatorio.map(f => f.id === id ? { ...f, descricao } : f))
  }

  // Calcular valor total
  const calcularTotal = () => {
    const totalServicos = servicosSelecionados.reduce((acc, s) => acc + (s.preco_unitario * s.quantidade), 0)
    const totalManuais = servicosManuais.reduce((acc, s) => acc + s.preco, 0)
    const totalDespesas = despesasExtras.reduce((acc, d) => acc + d.valor, 0)
    return totalServicos + totalManuais + totalDespesas
  }

  // Função para gerar orçamento
  const gerarOrcamento = () => {
    const orcamento = {
      cliente,
      servicosSelecionados,
      servicosManuais,
      despesasExtras,
      observacoesGerais,
      valorTotal: calcularTotal(),
      dataCriacao: new Date().toLocaleDateString('pt-BR')
    }

    console.log('Orçamento gerado:', orcamento)

    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Orçamento de Serviços Elétricos', 14, 20)

    doc.setFontSize(12)
    doc.text(`Cliente: ${orcamento.cliente.nome}`, 14, 30)
    doc.text(`Contato: ${orcamento.cliente.contato}`, 14, 37)
    if (orcamento.cliente.endereco) {
      doc.text(`Endereço: ${orcamento.cliente.endereco}`, 14, 44)
    }
    doc.text(`Data: ${orcamento.dataCriacao}`, 14, 51)

    autoTable(doc, {
      startY: 60,
      head: [['Serviço', 'Qtd / m²', 'Observações', 'Preço']],
      body: [
        ...orcamento.servicosSelecionados.map(s => [
          s.nome,
          s.categoria === 'Laudos' ? `${s.quantidade} m²` : s.quantidade,
          s.observacoes || '',
          `R$ ${(s.preco_unitario * s.quantidade).toFixed(2)}`
        ]),
        ...orcamento.servicosManuais.map(s => [s.nome, 1, s.descricao || '', `R$ ${s.preco.toFixed(2)}`])
      ]
    })

    let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 60

    if (orcamento.despesasExtras.length > 0) {
      autoTable(doc, {
        startY: finalY + 10,
        head: [['Despesa', 'Valor']],
        body: orcamento.despesasExtras.map(d => [d.descricao, `R$ ${d.valor.toFixed(2)}`])
      })
      finalY = doc.lastAutoTable.finalY
    }

    if (orcamento.observacoesGerais) {
      doc.text(`Observações: ${orcamento.observacoesGerais}`, 14, finalY + 10)
      finalY += 16
    }

    doc.setFontSize(14)
    doc.text(`Total: R$ ${orcamento.valorTotal.toFixed(2)}`, 14, finalY + 20)

    doc.save(`orcamento-${orcamento.cliente.nome || 'cliente'}.pdf`)
    alert('Orçamento gerado em PDF com sucesso!')
  }

  // Função para gerar relatório
  const gerarRelatorio = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Relatório de Inspeção', 14, 20)

    doc.setFontSize(12)
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30)

    let y = 40

    if (problemasEletricosSelecionados.length > 0) {
      doc.text('Problemas Elétricos:', 14, y)
      y += 6
      problemasEletricosSelecionados.forEach(p => {
        doc.text(`- ${p}`, 16, y)
        y += 6
      })
    }

    if (outrosProblemasSelecionados.length > 0) {
      doc.text('Outros Problemas:', 14, y)
      y += 6
      outrosProblemasSelecionados.forEach(p => {
        doc.text(`- ${p}`, 16, y)
        y += 6
      })
    }

    if (descricaoRelatorio) {
      doc.text('Observações:', 14, y)
      y += 6
      const linhas = doc.splitTextToSize(descricaoRelatorio, 180)
      doc.text(linhas, 16, y)
      y += linhas.length * 6 + 4
    }

    fotosRelatorio.forEach(foto => {
      const props = doc.getImageProperties(foto.src)
      const w = 180
      const h = props.height * w / props.width
      if (y + h > 280) {
        doc.addPage()
        y = 20
      }
      doc.addImage(foto.src, props.fileType || 'JPEG', 14, y, w, h)
      y += h + 4
      if (foto.descricao) {
        const texto = doc.splitTextToSize(foto.descricao, 180)
        if (y + texto.length * 6 > 280) {
          doc.addPage()
          y = 20
        }
        doc.text(texto, 14, y)
        y += texto.length * 6 + 4
      }
    })

    doc.save('relatorio.pdf')
    alert('Relatório gerado em PDF com sucesso!')
  }

  // Função para limpar formulário
  const limparFormulario = () => {
    setCliente({ nome: '', contato: '', endereco: '' })
    setServicosSelecionados([])
    setServicosManuais([])
    setDespesasExtras([])
    setObservacoesGerais('')
    setCurrentTab('cliente')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Orçamento Elétrico</h1>
          </div>
          <p className="text-gray-600">Sistema para geração de orçamentos de serviços elétricos</p>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="cliente" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente
            </TabsTrigger>
            <TabsTrigger value="servicos" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="extras" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Extras
            </TabsTrigger>
            <TabsTrigger value="orcamento" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Orçamento
            </TabsTrigger>
            <TabsTrigger value="relatorio" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Relatório
            </TabsTrigger>
          </TabsList>

          {/* Aba Cliente */}
          <TabsContent value="cliente" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Cliente</CardTitle>
                <CardDescription>Informe os dados do cliente para o orçamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={cliente.nome}
                    onChange={(e) => setCliente({...cliente, nome: e.target.value})}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <Label htmlFor="contato">Contato *</Label>
                  <Input
                    id="contato"
                    value={cliente.contato}
                    onChange={(e) => setCliente({...cliente, contato: e.target.value})}
                    placeholder="Telefone ou email"
                  />
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={cliente.endereco}
                    onChange={(e) => setCliente({...cliente, endereco: e.target.value})}
                    placeholder="Endereço do cliente"
                  />
                </div>
                <Button 
                  onClick={() => setCurrentTab('servicos')}
                  disabled={!cliente.nome || !cliente.contato}
                  className="w-full"
                >
                  Próximo: Selecionar Serviços
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Serviços */}
          <TabsContent value="servicos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Serviços Disponíveis</CardTitle>
                <CardDescription>Selecione os serviços que serão executados</CardDescription>
              </CardHeader>
              <CardContent>
                {categories.map(categoria => (
                  <div key={categoria} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">{categoria}</h3>
                    <div className="grid gap-3">
                      {services.filter(s => s.categoria === categoria).map(servico => {
                        const selecionado = servicosSelecionados.find(s => s.id === servico.id)
                        return (
                          <div key={servico.id} className="border rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={!!selecionado}
                                onCheckedChange={() => toggleServico(servico)}
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-medium">{servico.nome}</h4>
                                    <p className="text-sm text-gray-600">{servico.descricao}</p>
                                  </div>
                                  <Badge variant="secondary">
                                    {servico.categoria === 'Laudos'
                                      ? `R$ ${servico.preco_padrao.toFixed(2)}/m²`
                                      : `R$ ${servico.preco_padrao.toFixed(2)}`
                                    }
                                  </Badge>
                                </div>

                                {selecionado && (
                                  <div className="mt-3 space-y-2">
                                    <div>
                                      <Label htmlFor={`quantidade-${servico.id}`}>
                                        {servico.categoria === 'Laudos' ? 'Metros²' : 'Quantidade'}
                                      </Label>
                                      <Input
                                        id={`quantidade-${servico.id}`}
                                        type="number"
                                        min="0"
                                        step={servico.categoria === 'Laudos' ? '0.01' : '1'}
                                        value={selecionado.quantidade}
                                        onChange={(e) => atualizarQuantidadeServico(servico.id, e.target.value)}
                                        className="w-24"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`preco-${servico.id}`}>Preço para este orçamento</Label>
                                      <Input
                                        id={`preco-${servico.id}`}
                                        type="number"
                                        step="0.01"
                                        value={selecionado.preco_unitario}
                                        onChange={(e) => atualizarPrecoServico(servico.id, e.target.value)}
                                        className="w-32"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`obs-${servico.id}`}>Observações</Label>
                                      <Textarea
                                        id={`obs-${servico.id}`}
                                        value={selecionado.observacoes}
                                        onChange={(e) => atualizarObservacoesServico(servico.id, e.target.value)}
                                        placeholder="Observações específicas para este serviço"
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" onClick={() => setCurrentTab('cliente')}>
                    Voltar
                  </Button>
                  <Button onClick={() => setCurrentTab('extras')} className="flex-1">
                    Próximo: Serviços Extras
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Extras */}
          <TabsContent value="extras" className="space-y-4">
            {/* Serviços Manuais */}
            <Card>
              <CardHeader>
                <CardTitle>Serviços Adicionais</CardTitle>
                <CardDescription>Adicione serviços que não estão na lista padrão</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="nome-manual">Nome do Serviço</Label>
                    <Input
                      id="nome-manual"
                      value={novoServicoManual.nome}
                      onChange={(e) => setNovoServicoManual({...novoServicoManual, nome: e.target.value})}
                      placeholder="Ex: Instalação especial"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricao-manual">Descrição</Label>
                    <Input
                      id="descricao-manual"
                      value={novoServicoManual.descricao}
                      onChange={(e) => setNovoServicoManual({...novoServicoManual, descricao: e.target.value})}
                      placeholder="Descrição do serviço"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preco-manual">Preço</Label>
                    <div className="flex gap-2">
                      <Input
                        id="preco-manual"
                        type="number"
                        step="0.01"
                        value={novoServicoManual.preco}
                        onChange={(e) => setNovoServicoManual({...novoServicoManual, preco: e.target.value})}
                        placeholder="0.00"
                      />
                      <Button onClick={adicionarServicoManual} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {servicosManuais.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Serviços Adicionados:</h4>
                    {servicosManuais.map(servico => (
                      <div key={servico.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <span className="font-medium">{servico.nome}</span>
                          {servico.descricao && <span className="text-gray-600 ml-2">- {servico.descricao}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>R$ {servico.preco.toFixed(2)}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removerServicoManual(servico.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Despesas Extras */}
            <Card>
              <CardHeader>
                <CardTitle>Despesas Extras</CardTitle>
                <CardDescription>Adicione despesas como combustível, deslocamento, etc.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="descricao-despesa">Descrição</Label>
                    <Input
                      id="descricao-despesa"
                      value={novaDespesa.descricao}
                      onChange={(e) => setNovaDespesa({...novaDespesa, descricao: e.target.value})}
                      placeholder="Ex: Combustível, Deslocamento"
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor-despesa">Valor</Label>
                    <div className="flex gap-2">
                      <Input
                        id="valor-despesa"
                        type="number"
                        step="0.01"
                        value={novaDespesa.valor}
                        onChange={(e) => setNovaDespesa({...novaDespesa, valor: e.target.value})}
                        placeholder="0.00"
                      />
                      <Button onClick={adicionarDespesaExtra} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {despesasExtras.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Despesas Adicionadas:</h4>
                    {despesasExtras.map(despesa => (
                      <div key={despesa.id} className="flex justify-between items-center p-3 border rounded">
                        <span>{despesa.descricao}</span>
                        <div className="flex items-center gap-2">
                          <Badge>R$ {despesa.valor.toFixed(2)}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removerDespesaExtra(despesa.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle>Observações Gerais</CardTitle>
                <CardDescription>Adicione observações gerais sobre o orçamento</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={observacoesGerais}
                  onChange={(e) => setObservacoesGerais(e.target.value)}
                  placeholder="Observações gerais sobre o orçamento..."
                  rows={4}
                />
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentTab('servicos')}>
                Voltar
              </Button>
              <Button onClick={() => setCurrentTab('orcamento')} className="flex-1">
                Finalizar: Ver Orçamento
              </Button>
            </div>
          </TabsContent>

          {/* Aba Orçamento */}
          <TabsContent value="orcamento" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Orçamento Final
                </CardTitle>
                <CardDescription>Resumo do orçamento gerado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dados do Cliente */}
                <div>
                  <h3 className="font-semibold mb-2">Cliente:</h3>
                  <p><strong>Nome:</strong> {cliente.nome}</p>
                  <p><strong>Contato:</strong> {cliente.contato}</p>
                  {cliente.endereco && <p><strong>Endereço:</strong> {cliente.endereco}</p>}
                </div>

                <Separator />

                {/* Serviços Selecionados */}
                {servicosSelecionados.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Serviços Selecionados:</h3>
                    <div className="space-y-2">
                      {servicosSelecionados.map(servico => (
                        <div key={servico.id} className="flex justify-between items-start p-3 border rounded">
                          <div className="flex-1">
                            <p className="font-medium">{servico.nome}</p>
                            <p className="text-sm text-gray-600">{servico.descricao}</p>
                            {servico.observacoes && (
                              <p className="text-sm text-blue-600 mt-1">Obs: {servico.observacoes}</p>
                            )}
                          </div>
                          <Badge>
                            {servico.categoria === 'Laudos'
                              ? `${servico.quantidade} m² x R$ ${servico.preco_unitario.toFixed(2)} = R$ ${(servico.preco_unitario * servico.quantidade).toFixed(2)}`
                              : `${servico.quantidade}x R$ ${servico.preco_unitario.toFixed(2)} = R$ ${(servico.preco_unitario * servico.quantidade).toFixed(2)}`
                            }
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Serviços Manuais */}
                {servicosManuais.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Serviços Adicionais:</h3>
                    <div className="space-y-2">
                      {servicosManuais.map(servico => (
                        <div key={servico.id} className="flex justify-between items-start p-3 border rounded">
                          <div>
                            <p className="font-medium">{servico.nome}</p>
                            {servico.descricao && <p className="text-sm text-gray-600">{servico.descricao}</p>}
                          </div>
                          <Badge>R$ {servico.preco.toFixed(2)}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Despesas Extras */}
                {despesasExtras.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Despesas Extras:</h3>
                    <div className="space-y-2">
                      {despesasExtras.map(despesa => (
                        <div key={despesa.id} className="flex justify-between items-center p-3 border rounded">
                          <span>{despesa.descricao}</span>
                          <Badge>R$ {despesa.valor.toFixed(2)}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observações Gerais */}
                {observacoesGerais && (
                  <div>
                    <h3 className="font-semibold mb-2">Observações Gerais:</h3>
                    <p className="text-gray-700 p-3 border rounded bg-gray-50">{observacoesGerais}</p>
                  </div>
                )}

                <Separator />

                {/* Total */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    Total: R$ {calcularTotal().toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setCurrentTab('extras')}>
                    Voltar
                  </Button>
                  <Button onClick={gerarOrcamento} className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Orçamento
                  </Button>
                  <Button variant="outline" onClick={limparFormulario}>
                    Novo Orçamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Relatório */}
          <TabsContent value="relatorio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Registro de Problemas
                </CardTitle>
                <CardDescription>Capture fotos e descreva problemas encontrados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Problemas Elétricos</h3>
                  <div className="grid gap-2">
                    {problemasEletricos.map(p => (
                      <Label key={p} className="flex items-center gap-2">
                        <Checkbox
                          checked={problemasEletricosSelecionados.includes(p)}
                          onCheckedChange={() =>
                            toggleSelecao(
                              p,
                              problemasEletricosSelecionados,
                              setProblemasEletricosSelecionados
                            )
                          }
                        />
                        {p}
                      </Label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Outros Problemas</h3>
                  <div className="grid gap-2">
                    {outrosProblemas.map(p => (
                      <Label key={p} className="flex items-center gap-2">
                        <Checkbox
                          checked={outrosProblemasSelecionados.includes(p)}
                          onCheckedChange={() =>
                            toggleSelecao(
                              p,
                              outrosProblemasSelecionados,
                              setOutrosProblemasSelecionados
                            )
                          }
                        />
                        {p}
                      </Label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao-relatorio">Descrição Adicional</Label>
                  <Textarea
                    id="descricao-relatorio"
                    value={descricaoRelatorio}
                    onChange={(e) => setDescricaoRelatorio(e.target.value)}
                    placeholder="Descreva detalhes adicionais"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="foto-relatorio">Capturar Foto</Label>
                    <Input
                      id="foto-relatorio"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={adicionarFotoRelatorio}
                    />
                  </div>
                  {fotosRelatorio.map(foto => (
                    <div key={foto.id} className="space-y-2">
                      <img src={foto.src} alt="Evidência" className="w-full max-w-xs rounded" />
                      <Textarea
                        value={foto.descricao}
                        onChange={(e) => atualizarDescricaoFoto(foto.id, e.target.value)}
                        placeholder="Descrição da foto"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={gerarRelatorio} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App



// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

